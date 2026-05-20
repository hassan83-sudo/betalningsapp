const Debt = require("../models/Debt");

// Hämta skulder / filtrera per user
exports.getDebts = async (req, res) => {
  try {
    const userId = req.query.userId;

    const query = userId ? { userId } : {};

    const debts = await Debt.find(query).sort({ createdAt: -1 });

    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta skulder" });
  }
};

// Lägg till skuld
exports.addDebt = async (req, res) => {
  try {
    const { name, amount, priority, monthlyPayment, userId } = req.body;

    const newDebt = new Debt({
      name,
      amount,
      priority: priority || "medium",
      monthlyPayment: monthlyPayment || 0,
      userId: userId || null // 🔥 viktigt
    });

    await newDebt.save();
    res.json(newDebt);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte lägga till skuld" });
  }
};

// Uppdatera skuld
exports.updateDebt = async (req, res) => {
  try {
    const { name, amount, priority, monthlyPayment } = req.body;

    const updatedDebt = await Debt.findByIdAndUpdate(
      req.params.id,
      {
        name,
        amount,
        priority,
        monthlyPayment
      },
      { new: true }
    );

    res.json(updatedDebt);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte uppdatera skuld" });
  }
};

// Betala skuld
exports.payDebt = async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({ error: "Skuld hittades inte" });
    }

    debt.paid = true;
    await debt.save();

    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte markera som betald" });
  }
};

// Ta bort skuld
exports.deleteDebt = async (req, res) => {
  try {
    await Debt.findByIdAndDelete(req.params.id);
    res.json({ message: "Skuld borttagen" });
  } catch (error) {
    res.status(500).json({ error: "Kunde inte ta bort skuld" });
  }
};

// Auto (om du använder den)
exports.autoDebt = async (req, res) => {
  try {
    const debts = await Debt.find();
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: "Auto-funktion misslyckades" });
  }
};