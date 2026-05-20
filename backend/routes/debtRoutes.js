const express = require("express");
const router = express.Router();

const Debt = require("../models/Debt");

const {
  getDebts,
  addDebt,
  updateDebt,
  payDebt,
  deleteDebt,
  autoDebt,
} = require("../controllers/debtController");

router.get("/", getDebts);
router.post("/", addDebt);
router.put("/:id", updateDebt);
router.post("/pay/:id", payDebt);
router.delete("/:id", deleteDebt);
router.post("/auto", autoDebt);

// Begär mer tid
router.post("/request-time/:id", async (req, res) => {
  try {
    console.log("REQUEST TIME:", req.params.id);

    const updated = await Debt.findByIdAndUpdate(
      req.params.id,
      {
        requestedMoreTime: true,
        timeStatus: "pending",
        timeApproved: false
      },
      { returnDocument: "after" }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Kunde inte begära mer tid" });
  }
});

// Godkänn mer tid + välj antal dagar
router.post("/approve-time/:id", async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 7;

    console.log("APPROVE KLICKAD:", req.params.id, "DAGAR:", days);

    const debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({ error: "Fakturan hittades inte" });
    }

    const newDeadline = debt.deadline
      ? new Date(debt.deadline)
      : new Date();

    newDeadline.setDate(newDeadline.getDate() + days);

    const updated = await Debt.findByIdAndUpdate(
      req.params.id,
      {
        requestedMoreTime: true,
        timeStatus: "approved",
        timeApproved: true,
        deadline: newDeadline
      },
      { returnDocument: "after" }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Kunde inte godkänna mer tid" });
  }
});

// Avslå mer tid
router.post("/reject-time/:id", async (req, res) => {
  try {
    console.log("REJECT KLICKAD:", req.params.id);

    const updated = await Debt.findByIdAndUpdate(
      req.params.id,
      {
        requestedMoreTime: true,
        timeStatus: "rejected",
        timeApproved: false
      },
      { returnDocument: "after" }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Kunde inte avslå mer tid" });
  }
});

module.exports = router;