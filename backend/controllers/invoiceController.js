const Invoice = require("../models/Invoice");

const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      name,
      amount,
      priority,
      monthlyPayment,
      deadline,
      userId
    } = req.body;

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),

      name,
      amount,
      priority,
      monthlyPayment,
      deadline,
      userId
    });

    res.status(201).json(invoice);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not create invoice"
    });
  }
};

exports.getInvoices = async (req, res) => {
  try {

    const invoices = await Invoice.find()
      .sort({ createdAt: -1 });

    res.json(invoices);

  } catch (error) {

    res.status(500).json({
      message: "Could not fetch invoices"
    });
  }
};

exports.markInvoicePaid = async (req, res) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    invoice.paid = true;

    invoice.paidAt = new Date();

    invoice.paymentHistory.push({
      amount: invoice.amount
    });

    await invoice.save();

    res.json(invoice);

  } catch (error) {

    res.status(500).json({
      message: "Could not update invoice"
    });
  }
};