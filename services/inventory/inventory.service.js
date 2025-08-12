// ===================================
// 6. INVENTORY SERVICE
// File: services/inventory/inventory.service.js
const mongoose = require("mongoose");
const Inventory = require("./inventory.model");
const InventoryMovement = require("./inventoryMovement.model");
const Product = require("../product/product.model");

class InventoryService {
  // Update inventory from purchase
  async updateInventoryFromPurchase(
    productId,
    quantity,
    costPerUnit,
    purchaseId,
    session = null
  ) {
    try {
      // Get or create inventory record
      let inventory = await Inventory.findOne({ productId }).session(session);

      if (!inventory) {
        // Create new inventory record
        const lastInventory = await Inventory.findOne()
          .sort({ inventoryId: -1 })
          .session(session);
        const nextInventoryId = lastInventory
          ? lastInventory.inventoryId + 1
          : 1;

        inventory = new Inventory({
          inventoryId: nextInventoryId,
          productId: productId,
          availableQuantity: 0,
          weightedAverageCost: 0,
          totalValue: 0,
          lastUpdatedDate: new Date(),
          createdDate: new Date(),
        });
      }

      // Calculate new weighted average cost
      const currentValue =
        inventory.availableQuantity * inventory.weightedAverageCost;
      const addedValue = quantity * costPerUnit;
      const newTotalQuantity = inventory.availableQuantity + quantity;
      const newTotalValue = currentValue + addedValue;
      const newWeightedAverageCost =
        newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : 0;

      // Update inventory
      inventory.availableQuantity = newTotalQuantity;
      inventory.weightedAverageCost =
        Math.round(newWeightedAverageCost * 100) / 100;
      inventory.totalValue = Math.round(newTotalValue * 100) / 100;
      inventory.lastUpdatedDate = new Date();

      await inventory.save({ session });

      // Record inventory movement
      await this.recordInventoryMovement(
        {
          productId,
          movementType: "PURCHASE_IN",
          quantity: quantity,
          costPerUnit: costPerUnit,
          totalValue: addedValue,
          referenceId: purchaseId,
          referenceType: "PURCHASE",
          balanceQuantity: newTotalQuantity,
          balanceValue: newTotalValue,
          remarks: `Purchase from purchase ID: ${purchaseId}`,
        },
        session
      );

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  // Update inventory from sale
  async updateInventoryFromSale(
    productId,
    quantity,
    invoiceId,
    session = null
  ) {
    try {
      const inventory = await Inventory.findOne({ productId }).session(session);

      if (!inventory) {
        throw new Error(`No inventory found for product ID: ${productId}`);
      }

      if (inventory.availableQuantity < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${inventory.availableQuantity}, Required: ${quantity}`
        );
      }

      // Calculate values
      const currentCostPerUnit = inventory.weightedAverageCost;
      const saleValue = quantity * currentCostPerUnit;
      const newQuantity = inventory.availableQuantity - quantity;
      const newTotalValue = inventory.totalValue - saleValue;

      // Update inventory
      inventory.availableQuantity = newQuantity;
      inventory.totalValue = Math.round(newTotalValue * 100) / 100;
      inventory.lastUpdatedDate = new Date();

      await inventory.save({ session });

      // Record inventory movement
      await this.recordInventoryMovement(
        {
          productId,
          movementType: "SALE_OUT",
          quantity: -quantity, // Negative for outward movement
          costPerUnit: currentCostPerUnit,
          totalValue: -saleValue, // Negative for outward movement
          referenceId: invoiceId,
          referenceType: "INVOICE",
          balanceQuantity: newQuantity,
          balanceValue: newTotalValue,
          remarks: `Sale from invoice ID: ${invoiceId}`,
        },
        session
      );

      return {
        inventory,
        costPerUnit: currentCostPerUnit,
        totalCost: saleValue,
      };
    } catch (error) {
      throw error;
    }
  }

  // Record inventory movement
  async recordInventoryMovement(movementData, session = null) {
    const lastMovement = await InventoryMovement.findOne()
      .sort({ movementId: -1 })
      .session(session);
    const nextMovementId = lastMovement ? lastMovement.movementId + 1 : 1;

    const movement = new InventoryMovement({
      movementId: nextMovementId,
      ...movementData,
      movementDate: new Date(),
      createdDate: new Date(),
    });

    return await movement.save({ session });
  }

  // Get current inventory
  async getCurrentInventory(filters = {}) {
    const query = {};

    if (filters.productId) query.productId = filters.productId;
    if (filters.lowStock) {
      query.availableQuantity = { $lte: filters.lowStock };
    }

    const inventory = await Inventory.find(query)
      .populate({
        path: "productId",
        model: "Product",
        localField: "productId",
        foreignField: "productId",
      })
      .sort({ lastUpdatedDate: -1 });

    return inventory;
  }

  // Get inventory movements
  async getInventoryMovements(productId, fromDate, toDate) {
    const query = { productId };

    if (fromDate && toDate) {
      query.movementDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    return await InventoryMovement.find(query).sort({ movementDate: -1 });
  }

  // Get inventory value
  async getTotalInventoryValue() {
    const result = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalValue" },
          totalQuantity: { $sum: "$availableQuantity" },
        },
      },
    ]);

    return result[0] || { totalValue: 0, totalQuantity: 0 };
  }
  
  // Add this method to existing InventoryService class
  async updateInventoryFromSale(
    productId,
    quantity,
    invoiceId,
    session = null,
    checkOnly = false
  ) {
    try {
      const inventory = await Inventory.findOne({ productId }).session(session);

      if (!inventory) {
        if (checkOnly) {
          return { costPerUnit: 0, totalCost: 0 };
        }
        throw new Error(`No inventory found for product ID: ${productId}`);
      }

      if (inventory.availableQuantity < quantity) {
        if (checkOnly) {
          // Return current cost even if insufficient stock for preview
          return {
            costPerUnit: inventory.weightedAverageCost,
            totalCost: quantity * inventory.weightedAverageCost,
            insufficient: true,
            available: inventory.availableQuantity,
          };
        }
        throw new Error(
          `Insufficient stock. Available: ${inventory.availableQuantity}, Required: ${quantity}`
        );
      }

      const currentCostPerUnit = inventory.weightedAverageCost;
      const saleValue = quantity * currentCostPerUnit;

      if (checkOnly) {
        return {
          costPerUnit: currentCostPerUnit,
          totalCost: saleValue,
        };
      }

      const newQuantity = inventory.availableQuantity - quantity;
      const newTotalValue = inventory.totalValue - saleValue;

      // Update inventory
      inventory.availableQuantity = newQuantity;
      inventory.totalValue = Math.round(newTotalValue * 100) / 100;
      inventory.lastUpdatedDate = new Date();

      await inventory.save({ session });

      // Record inventory movement
      await this.recordInventoryMovement(
        {
          productId,
          movementType: "SALE_OUT",
          quantity: -quantity,
          costPerUnit: currentCostPerUnit,
          totalValue: -saleValue,
          referenceId: invoiceId,
          referenceType: "INVOICE",
          balanceQuantity: newQuantity,
          balanceValue: newTotalValue,
          remarks: `Sale from invoice ID: ${invoiceId}`,
        },
        session
      );

      return {
        inventory,
        costPerUnit: currentCostPerUnit,
        totalCost: saleValue,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventoryService();
