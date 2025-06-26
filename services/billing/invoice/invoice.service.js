const Invoice = require('../models/invoiceOverview.model'); // InvoiceOverView model
const InvoiceDetails = require('../models/invoiceDetails.model');
const Payment = require('../models/payment.model');

const clientService = require('../../client/client.service');
const particularService = require('../../particular/particular.service');
const clientOutstandingService = require('../clientOutstanding/clientOutstanding.service');

const moment = require('moment');

async function  createBill(invoiceDetailsDto) {
  const { invoice, billAmountDetails, client, payment, remarks } = invoiceDetailsDto;
  const now = moment().toDate();

  // 1. Validate client
  const isClientValid = await clientService.isClientPresent(client);
  if (!isClientValid) throw new Error('Client not found');

  // 2. Validate bill totals
  validateBill(invoice, billAmountDetails);

  // 3. Save payment
  const paymentDoc = await Payment.create({
    clientId: client.clientId,
    amount: payment.paymentAmount,
    paymentMode: payment.paymentMode,
    paymentDate: payment.paymentDate,
    createdDate: now,
    modifiedDate: now,
  });

  // 4. Save invoice overview
  const invoiceOverView = await Invoice.create({
    clientId: client.clientId,
    paymentId: paymentDoc._id,
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
  });

  // 5. Save invoice line items
  const invoiceDetails = invoice.map((item) => ({
    invoiceId: invoiceOverView._id,
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

  await InvoiceDetails.insertMany(invoiceDetails);

  // 6. Create particulars if needed
  const particulars = invoice.map((x) => ({
    particularName: x.perticulars,
    discountPercentage: x.discount,
  }));
  await particularService.createMultipleParticular(particulars);

  // 7. Update client outstanding
  await clientOutstandingService.updateCustomerOutstanding(client.clientId);

  return { message: 'Invoice created successfully' };
}

function validateBill(invoice, billAmountDetails) {
  const subTotal = invoice.reduce((acc, item) => {
    const netAmount = item.amount * item.quanity * (1 - item.discount / 100);
    return acc + netAmount;
  }, 0);

  const discount = (subTotal * billAmountDetails.overallDiscountPercentage) / 100;
  const tax = ((subTotal - discount) * billAmountDetails.taxPercentage) / 100;
  const grandTotal = subTotal - discount + tax;

  const round = (val) => Math.round(val * 100) / 100;

  if (round(subTotal) !== round(billAmountDetails.subTotalAmount)) {
    throw new Error('Subtotal mismatch');
  }
  if (round(tax) !== round(billAmountDetails.taxAmount)) {
    throw new Error('Tax mismatch');
  }
  if (round(grandTotal) !== round(billAmountDetails.grandTotalAmount)) {
    throw new Error('Grand total mismatch');
  }

  const unverified = invoice.find((item) => item.verified === false);
  if (unverified) {
    throw new Error('One or more items not verified');
  }
}

async function generateInvoiceId() {
  const last = await Invoice.findOne().sort({ invoiceId: -1 }).exec();
  return last ? last.invoiceId + 1 : 1;
}

async function getInvoiceById(invoiceId) {
  const invoice = await Invoice.findById(invoiceId).populate('paymentId');
  if (!invoice) throw new Error('Invoice not found');
  return invoice;
}

async function getInvoicesByClientId(clientId) {
  const exists = await clientService.isClientPresentByClientId(clientId);
  if (!exists) throw new Error('Client not found');
  return Invoice.find({ clientId });
}

async function addDiscountToBill(invoiceId, clientId, billAmountDetailsDto, remarks) {
  if (!remarks) throw new Error('Remarks required');

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');

  if (invoice.subTotalAmount !== billAmountDetailsDto.subTotalAmount) {
    throw new Error('Subtotal mismatch');
  }

  const discount = (invoice.subTotalAmount * billAmountDetailsDto.overallDiscountPercentage) / 100;
  const tax = ((invoice.subTotalAmount - discount) * billAmountDetailsDto.taxPercentage) / 100;
  const grandTotal = invoice.subTotalAmount - discount + tax;

  const round = (val) => Math.round(val * 100) / 100;

  if (round(grandTotal) !== round(billAmountDetailsDto.grandTotalAmount)) {
    throw new Error('Grand total mismatch');
  }

  const updatedInvoice = await Invoice.findByIdAndUpdate(
    invoiceId,
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
  validateBill,
  generateInvoiceId,
  getInvoiceById,
  getInvoicesByClientId,
  addDiscountToBill,
};
