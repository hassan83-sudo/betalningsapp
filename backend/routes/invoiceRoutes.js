const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getInvoices,
  markInvoicePaid
} = require("../controllers/invoiceController");

router.post("/", createInvoice);
router.get("/", getInvoices);
router.patch("/:id/pay", markInvoicePaid);

module.exports = router;