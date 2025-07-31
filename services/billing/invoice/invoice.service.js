const mongoose = require('mongoose');
const InvoiceOverview = require('./invoiceOverview.model');
const InvoiceDetails = require('./invoiceDetails.model');
const Payment = require('../payment/payment.model');

const clientService = require('../../client/client.service');
const particularService = require('../../particular/particular.service');
const clientOutstandingService = require('../clientOutstanding/clientOutstanding.service');

const moment = require('moment');

async function createBill(invoiceDetailsDto) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoice, billAmountDetails, client, payment, remarks } = invoiceDetailsDto;
    const now = moment().toDate();

    // 1. Validate client
    const isClientValid = await clientService.isClientPresent(client);
    if (!isClientValid) {
      throw new Error('Client not found');
    }

    // 2. Validate bill totals
    validateBill(invoice, billAmountDetails);

    // 3. Generate payment ID and save payment
    const lastPayment = await Payment.findOne().sort({ paymentId: -1 }).session(session);
    const paymentId = lastPayment ? lastPayment.paymentId + 1 : 1;

    const paymentDoc = await Payment.create([{
      paymentId: paymentId,
      clientId: client.clientId,
      amount: payment.paymentAmount,
      paymentMode: payment.paymentMode,
      paymentDate: payment.paymentDate,
      createdDate: now,
      modifiedDate: now,
    }], { session });

    // 4. Generate invoice ID and save invoice overview
    const lastInvoice = await InvoiceOverview.findOne().sort({ invoiceId: -1 }).session(session);
    const invoiceId = lastInvoice ? lastInvoice.invoiceId + 1 : 1;

    const invoiceOverView = await InvoiceOverview.create([{
      invoiceId: invoiceId,
      clientId: client.clientId,
      paymentId: paymentDoc[0].paymentId,
      invoiceDate: payment.paymentDate,
      subTotalAmount: billAmountDetails.subTotalAmount,
      taxPercentage: billAmountDetails.taxPercentage,
      taxAmount: billAmountDetails.taxAmount,
      discountPercentage: billAmountDetails.overallDiscountPercentage,
      discountAmount: billAmountDetails.overallDiscountAmount,
      grandTotalAmount: billAmountDetails.grandTotalAmount,
      remarks,
      createdDate: now,
      modifiedDate: now,
    }], { session });

    // 5. Generate invoice details IDs and save invoice line items
    const lastInvoiceDetail = await InvoiceDetails.findOne().sort({ invoiceDetailsId: -1 }).session(session);
    let invoiceDetailsId = lastInvoiceDetail ? lastInvoiceDetail.invoiceDetailsId + 1 : 1;

    const invoiceDetails = invoice.map((item) => ({
      invoiceDetailsId: invoiceDetailsId++,
      invoiceId: invoiceOverView[0]._id,
      slNo: item.slNo,
      perticulars: item.perticulars,
      amount: item.amount,
      quanity: item.quanity,
      discountPercentage: item.discount,
      total: item.total,
      discountTotal: item.discountPrice,
      quantityType: item.quantityType,
      verified: item.verified,
      createdDate: now,
      modifiedDate: now,
    }));

    await InvoiceDetails.insertMany(invoiceDetails, { session });

    // 6. Create particulars if needed
    const particulars = invoice.map((x) => ({
      particularName: x.perticulars,
      discountPercentage: x.discount,
    }));
    await particularService.createMultipleParticular(particulars);

    // 7. Update client outstanding
    await clientOutstandingService.updateCustomerOutstanding(client.clientId);

    await session.commitTransaction();
    session.endSession();

    return { message: 'Invoice created successfully' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

function validateBill(invoice, billAmountDetails) {
  // Calculate subtotal from line items
  const subTotal = invoice.reduce((acc, item) => {
    const netAmount = item.amount * item.quanity * (1 - item.discount / 100);
    return acc + netAmount;
  }, 0);

  // Calculate discount and tax
  const discount = (subTotal * billAmountDetails.overallDiscountPercentage) / 100;
  const tax = ((subTotal - discount) * billAmountDetails.taxPercentage) / 100;
  const grandTotal = subTotal - discount + tax;

  const round = (val) => Math.round(val * 100) / 100;

  // Validate calculations
  if (round(subTotal) !== round(billAmountDetails.subTotalAmount)) {
    throw new Error('Subtotal mismatch');
  }
  if (round(tax) !== round(billAmountDetails.taxAmount)) {
    throw new Error('Tax mismatch');
  }
  if (round(grandTotal) !== round(billAmountDetails.grandTotalAmount)) {
    throw new Error('Grand total mismatch');
  }

  // Check if all items are verified
  const unverified = invoice.find((item) => item.verified === false);
  if (unverified) {
    throw new Error('One or more items not verified');
  }
}

async function updateBill(invoiceId, invoiceDetailsDto) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoice, billAmountDetails, client, payment, remarks } = invoiceDetailsDto;

    // 1. Validate client
    const isClientValid = await clientService.isClientPresent(client);
    if (!isClientValid) {
      throw new Error('Client not found');
    }

    // 2. Validate bill totals
    validateBill(invoice, billAmountDetails);

    // 3. Find existing invoice
    const existingInvoice = await InvoiceOverview.findOne({ invoiceId }).session(session);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    // 4. Update payment
    await Payment.findOneAndUpdate(
      { paymentId: payment.paymentId },
      {
        amount: payment.paymentAmount,
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        modifiedDate: new Date(),
      },
      { session }
    );

    // 5. Delete existing invoice details
    await InvoiceDetails.deleteMany({ invoiceId: existingInvoice._id }, { session });

    // 6. Update invoice overview
    await InvoiceOverview.findOneAndUpdate(
      { invoiceId },
      {
        subTotalAmount: billAmountDetails.subTotalAmount,
        taxPercentage: billAmountDetails.taxPercentage,
        taxAmount: billAmountDetails.taxAmount,
        discountPercentage: billAmountDetails.overallDiscountPercentage,
        discountAmount: billAmountDetails.overallDiscountAmount,
        grandTotalAmount: billAmountDetails.grandTotalAmount,
        remarks,
        modifiedDate: new Date(),
      },
      { session }
    );

    // 7. Create new invoice details
    const lastInvoiceDetail = await InvoiceDetails.findOne().sort({ invoiceDetailsId: -1 }).session(session);
    let invoiceDetailsId = lastInvoiceDetail ? lastInvoiceDetail.invoiceDetailsId + 1 : 1;

    const invoiceDetails = invoice.map((item) => ({
      invoiceDetailsId: invoiceDetailsId++,
      invoiceId: existingInvoice._id,
      slNo: item.slNo,
      perticulars: item.perticulars,
      amount: item.amount,
      quanity: item.quanity,
      discountPercentage: item.discount,
      total: item.total,
      discountTotal: item.discountPrice,
      quantityType: item.quantityType,
      verified: item.verified,
      createdDate: existingInvoice.createdDate,
      modifiedDate: new Date(),
    }));

    await InvoiceDetails.insertMany(invoiceDetails, { session });

    // 8. Create particulars if needed
    const particulars = invoice.map((x) => ({
      particularName: x.perticulars,
      discountPercentage: x.discount,
    }));
    await particularService.createMultipleParticular(particulars);

    // 9. Update client outstanding
    await clientOutstandingService.updateCustomerOutstanding(client.clientId);

    await session.commitTransaction();
    session.endSession();

    return { message: 'Invoice updated successfully' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function generateInvoiceId() {
  const last = await InvoiceOverview.findOne().sort({ invoiceId: -1 }).exec();
  return last ? last.invoiceId + 1 : 1;
}

async function getInvoiceById(invoiceId) {
  const invoice = await InvoiceOverview.findOne({ invoiceId })
    .populate({
      path: 'paymentId',
      model: 'Payment',
      localField: 'paymentId',
      foreignField: 'paymentId'
    });
  
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }

  // Also get invoice details
  const invoiceDetails = await InvoiceDetails.find({ invoiceId: invoice._id });
  
  return {
    ...invoice.toObject(),
    invoiceDetails
  };
}

async function getInvoiceByClientId(clientId) {
  const exists = await clientService.isClientPresentByClientId(clientId);
  if (!exists) {
    throw new Error('Client not found');
  }
  
  const invoices = await InvoiceOverview.find({ clientId }).sort({ createdDate: -1 });
  
  // Get invoice details for each invoice
  const invoicesWithDetails = await Promise.all(
    invoices.map(async (invoice) => {
      const invoiceDetails = await InvoiceDetails.find({ invoiceId: invoice._id });
      return {
        ...invoice.toObject(),
        invoiceDetails
      };
    })
  );
  
  return invoicesWithDetails;
}

async function addDiscountToBill(invoiceId, clientId, billAmountDetailsDto, remarks) {
  if (!remarks) {
    throw new Error('Remarks required');
  }

  const invoice = await InvoiceOverview.findOne({ invoiceId });
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Validate client exists
  const isClientValid = await clientService.isClientPresentByClientId(clientId);
  if (!isClientValid) {
    throw new Error('Client not found');
  }

  if (invoice.subTotalAmount !== billAmountDetailsDto.subTotalAmount) {
    throw new Error('Subtotal mismatch');
  }

  // Calculate new amounts
  const discount = (invoice.subTotalAmount * billAmountDetailsDto.overallDiscountPercentage) / 100;
  const tax = ((invoice.subTotalAmount - discount) * billAmountDetailsDto.taxPercentage) / 100;
  const grandTotal = invoice.subTotalAmount - discount + tax;

  const round = (val) => Math.round(val * 100) / 100;

  if (round(grandTotal) !== round(billAmountDetailsDto.grandTotalAmount)) {
    throw new Error('Grand total mismatch');
  }

  const updatedInvoice = await InvoiceOverview.findOneAndUpdate(
    { invoiceId },
    {
      discountPercentage: billAmountDetailsDto.overallDiscountPercentage,
      discountAmount: billAmountDetailsDto.overallDiscountAmount,
      taxAmount: billAmountDetailsDto.taxAmount,
      taxPercentage: billAmountDetailsDto.taxPercentage,
      grandTotalAmount: grandTotal,
      remarks,
      modifiedDate: new Date(),
    },
    { new: true }
  );

  await clientOutstandingService.updateCustomerOutstanding(clientId);
  return updatedInvoice;
}

module.exports = {
  createBill,
  updateBill,
  validateBill,
  generateInvoiceId,
  getInvoiceById,
  getInvoiceByClientId,
  addDiscountToBill,
};