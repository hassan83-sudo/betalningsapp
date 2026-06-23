require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const Stripe = require("stripe");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/betalningsapp";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, default: "" },
    userId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    deadline: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    stripeSessionId: { type: String, default: "" },
    paymentHistory: [
      {
        paidAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        method: { type: String, default: "manual" },
      },
    ],
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

function buildInvoiceEmailHtml(invoice, reminder = false) {
  const customerLink = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/?invoice=${invoice._id}`;

  return `
    <div style="font-family: Arial, sans-serif;">
      <h1>${reminder ? "Betalningspåminnelse" : "KronoPay Faktura"}</h1>
      <p>${
        reminder
          ? "Detta är en påminnelse om en obetald faktura."
          : "Du har fått en ny faktura."
      }</p>
      <p><strong>Fakturanummer:</strong> ${invoice.invoiceNumber || "-"}</p>
      <p><strong>Namn:</strong> ${invoice.customerName || invoice.name}</p>
      <p><strong>Email:</strong> ${invoice.customerEmail || "-"}</p>
      <p><strong>Belopp:</strong> ${invoice.amount} kr</p>
      <p><strong>Förfallodatum:</strong> ${
        invoice.deadline || invoice.dueDate || "-"
      }</p>
      <p><strong>Status:</strong> ${invoice.paid ? "Betald" : "Obetald"}</p>

      <p style="margin-top:20px;">
        <a
          href="${customerLink}"
          style="
            display:inline-block;
            background:#635bff;
            color:white;
            padding:12px 18px;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Öppna faktura
        </a>
      </p>
    </div>
  `;
}

function createInvoicePdfBuffer(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(24).text("FAKTURA", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("KronoPay");
    doc.moveDown();

    doc.text(`Fakturanummer: ${invoice.invoiceNumber || "-"}`);
    doc.text(`Namn: ${invoice.customerName || invoice.name}`);
    doc.text(`Email: ${invoice.customerEmail || "-"}`);
    doc.text(`Belopp: ${invoice.amount} kr`);
    doc.text(`Förfallodatum: ${invoice.deadline || invoice.dueDate || "-"}`);
    doc.text(`Status: ${invoice.paid ? "Betald" : "Obetald"}`);

    doc.end();
  });
}

async function sendInvoiceEmail(invoice, reminder = false) {
  if (!invoice.customerEmail) return;

  const pdfBuffer = await createInvoicePdfBuffer(invoice);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: invoice.customerEmail,
    subject: reminder
      ? `Påminnelse: Faktura ${invoice.invoiceNumber || "faktura"}`
      : `Ny faktura ${invoice.invoiceNumber || "faktura"}`,
    html: buildInvoiceEmailHtml(invoice, reminder),
    attachments: [
      {
        filename: `${invoice.invoiceNumber || "faktura"}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

app.use(helmet());
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "KronoPay backend körs" });
});

app.use("/api/auth", authRoutes);

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Användaren finns redan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    res.json({
      message: "Registrering lyckades",
      userId: user._id,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: "Register error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Fel email eller lösenord" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Fel email eller lösenord" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        isAdmin: user.isAdmin,
      },
      JWT_SECRET
    );

    res.json({
      token,
      userId: user._id,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Kunde inte hämta fakturor" });
  }
});

app.get("/api/public/invoice/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Faktura hittades inte" });
    }

    res.json({
      _id: invoice._id,
      customerName: invoice.customerName || invoice.name,
      customerEmail: invoice.customerEmail,
      amount: invoice.amount,
      deadline: invoice.deadline || invoice.dueDate,
      paid: invoice.paid,
      invoiceNumber: invoice.invoiceNumber,
    });
  } catch (err) {
    res.status(500).json({ message: "Kunde inte hämta faktura" });
  }
});

app.post("/api/invoices", async (req, res) => {
  try {
    const { name, customerName, customerEmail, amount, deadline, dueDate } =
      req.body;

    if (!name && !customerName) {
      return res.status(400).json({ message: "Kundnamn krävs" });
    }

    if (!amount) {
      return res.status(400).json({ message: "Belopp krävs" });
    }

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      name: name || customerName,
      customerName: customerName || name,
      customerEmail: customerEmail || "",
      amount: Number(amount),
      deadline: deadline || dueDate || "",
      dueDate: dueDate || deadline || "",
      paid: false,
    });

    try {
      await sendInvoiceEmail(invoice, false);
      console.log("Faktura-email skickad");
    } catch (emailErr) {
      console.error("Auto-email error:", emailErr.message);
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Create invoice error:", err.message);
    res.status(500).json({ message: "Kunde inte skapa faktura" });
  }
});

app.patch("/api/invoices/:id/pay", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Faktura hittades inte" });
    }

    invoice.paid = true;
    invoice.paidAt = new Date();

    invoice.paymentHistory.push({
      paidAt: invoice.paidAt,
      amount: invoice.amount,
      method: "manual",
    });

    await invoice.save();

    res.json({
      message: "Faktura betalad",
      invoice,
    });
  } catch (err) {
    res.status(500).json({ message: "Betalning misslyckades" });
  }
});

app.get("/api/invoices/:id/pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Faktura hittades inte" });
    }

    const pdfBuffer = await createInvoicePdfBuffer(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoiceNumber || "faktura"}.pdf"`
    );

    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: "PDF error" });
  }
});

app.post("/api/invoices/:id/send-reminder", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Faktura hittades inte" });
    }

    if (!invoice.customerEmail) {
      return res.status(400).json({ message: "Kund-email saknas" });
    }

    await sendInvoiceEmail(invoice, true);

    res.json({ message: "Påminnelse skickad" });
  } catch (err) {
    res.status(500).json({ message: "Kunde inte skicka påminnelse" });
  }
});

app.post("/api/invoices/send-reminders", async (req, res) => {
  try {
    const invoices = await Invoice.find({
      paid: false,
      customerEmail: { $exists: true, $nin: ["", null] },
    });

    let sent = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        await sendInvoiceEmail(invoice, true);
        sent++;
      } catch {
        failed++;
      }
    }

    res.json({
      message: "Påminnelser klara",
      sent,
      failed,
    });
  } catch (err) {
    res.status(500).json({
      message: "Kunde inte skicka alla påminnelser",
      error: err.message,
    });
  }
});

app.post("/api/invoices/:id/send-email", async (req, res) => {
  try {
    const { to } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Faktura hittades inte" });
    }

    if (to) {
      invoice.customerEmail = to;
    }

    if (!invoice.customerEmail) {
      return res.status(400).json({ message: "Mottagarens email krävs" });
    }

    await sendInvoiceEmail(invoice, false);

    res.json({ message: "Email skickat" });
  } catch (err) {
    res.status(500).json({ message: "Email error" });
  }
});

app.delete("/api/invoices/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Faktura borttagen" });
  } catch (err) {
    res.status(500).json({ message: "Delete error" });
  }
});

app.post("/api/invoices/:id/create-checkout-session", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Faktura hittades inte" });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        invoiceId: invoice._id.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: invoice.customerName || invoice.name || "KronoPay faktura",
            },
            unit_amount: Math.round(Number(invoice.amount || 0) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${clientUrl}?paid=${invoice._id}`,
      cancel_url: `${clientUrl}?cancelled=true`,
    });

    invoice.stripeSessionId = session.id;
    await invoice.save();

    res.json({
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe error:", err.message);

    res.status(500).json({
      message: "Stripe error",
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server körs på port ${PORT}`);
});
