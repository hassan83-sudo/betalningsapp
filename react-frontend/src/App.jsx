import React, { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

export default function App() {
  const [invoices, setInvoices] = useState([]);
  const [publicInvoice, setPublicInvoice] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [authMode, setAuthMode] =
    useState("login");

  const [authForm, setAuthForm] =
    useState({
      email: "",
      password: "",
    });

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    amount: "",
    deadline: "",
  });

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(
        window.location.search
      );

      const invoiceId =
        params.get("invoice");

      const paidId =
        params.get("paid");

      const cancelled =
        params.get("cancelled");

      if (paidId) {
        await fetch(
          `${API_URL}/api/invoices/${paidId}/pay`,
          {
            method: "PATCH",
          }
        );

        setMessage(
          "Stripe-betalning klar. Fakturan är markerad som betald."
        );

        window.history.replaceState(
          {},
          "",
          window.location.pathname
        );
      }

      if (cancelled) {
        setMessage(
          "Stripe-betalning avbröts."
        );

        window.history.replaceState(
          {},
          "",
          window.location.pathname
        );
      }

      if (invoiceId) {
        const res = await fetch(
          `${API_URL}/api/public/invoice/${invoiceId}`
        );

        const data =
          await res.json();

        setPublicInvoice(data);

        return;
      }

      if (token) {
        fetchInvoices();
      }
    }

    init();
  }, [token]);

  async function fetchInvoices() {
    try {
      const res = await fetch(
        `${API_URL}/api/invoices`
      );

      const data =
        await res.json();

      setInvoices(data);
    } catch {
      setMessage(
        "Kunde inte hämta fakturor"
      );
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  }

  async function handleAuth(e) {
    e.preventDefault();

    const endpoint =
      authMode === "login"
        ? "login"
        : "register";

    const res = await fetch(
      `${API_URL}/api/${endpoint}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          authForm
        ),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {
      setMessage(
        data.message ||
          "Auth misslyckades"
      );

      return;
    }

    if (data.token) {
      localStorage.setItem(
        "token",
        data.token
      );

      setToken(data.token);

      setMessage("Inloggad");

      return;
    }

    setMessage(
      "Konto skapat. Logga in nu."
    );

    setAuthMode("login");
  }

  async function createInvoice(e) {
    e.preventDefault();

    const payload = {
      name: form.customerName,

      customerName:
        form.customerName,

      customerEmail:
        form.customerEmail,

      amount: Number(
        form.amount
      ),

      deadline:
        form.deadline,

      dueDate:
        form.deadline,
    };

    const res = await fetch(
      `${API_URL}/api/invoices`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

    if (!res.ok) {
      setMessage(
        "Kunde inte skapa faktura"
      );

      return;
    }

    setMessage("Faktura skapad");

    setForm({
      customerName: "",
      customerEmail: "",
      amount: "",
      deadline: "",
    });

    fetchInvoices();
  }

  async function payWithStripe(id) {
    const res = await fetch(
      `${API_URL}/api/invoices/${id}/create-checkout-session`,
      {
        method: "POST",
      }
    );

    const data =
      await res.json();

    if (data.url) {
      window.location.href =
        data.url;
    } else {
      setMessage(
        "Stripe-länk kunde inte skapas"
      );
    }
  }

  async function markPaid(id) {
    await fetch(
      `${API_URL}/api/invoices/${id}/pay`,
      {
        method: "PATCH",
      }
    );

    setMessage(
      "Faktura markerad som betald"
    );

    fetchInvoices();
  }

  async function sendReminder(id) {
    const res = await fetch(
      `${API_URL}/api/invoices/${id}/send-reminder`,
      {
        method: "POST",
      }
    );

    setMessage(
      res.ok
        ? "Påminnelse skickad"
        : "Påminnelse misslyckades"
    );
  }

  async function sendAllReminders() {
    const res = await fetch(
      `${API_URL}/api/invoices/send-reminders`,
      {
        method: "POST",
      }
    );

    setMessage(
      res.ok
        ? "Alla påminnelser skickade"
        : "Kunde inte skicka alla"
    );
  }

  async function deleteInvoice(id) {
    await fetch(
      `${API_URL}/api/invoices/${id}`,
      {
        method: "DELETE",
      }
    );

    setMessage(
      "Faktura borttagen"
    );

    fetchInvoices();
  }

  function openPdf(id) {
    window.open(
      `${API_URL}/api/invoices/${id}/pdf`,
      "_blank"
    );
  }

  function copyCustomerLink(id) {
    const url = `${window.location.origin}/?invoice=${id}`;

    navigator.clipboard.writeText(
      url
    );

    setMessage(
      "Kundlänk kopierad"
    );
  }

  function exportCSV() {
    const headers = [
      "Kund",
      "Email",
      "Belopp",
      "Förfallodatum",
      "Status",
    ];

    const rows = invoices.map(
      (invoice) => [
        invoice.customerName ||
          invoice.name ||
          "",

        invoice.customerEmail ||
          "",

        invoice.amount || 0,

        invoice.deadline ||
          invoice.dueDate ||
          "",

        invoice.paid
          ? "Betald"
          : "Obetald",
      ]
    );

    const csvContent = [
      headers.join(","),

      ...rows.map((row) =>
        row.join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "kronopay-fakturor.csv"
    );

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  }

  const totalAmount =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.amount || 0
        ),
      0
    );

  const unpaidInvoices =
    invoices.filter(
      (invoice) => !invoice.paid
    );

  const paidInvoices =
    invoices.filter(
      (invoice) => invoice.paid
    );

  if (publicInvoice) {
    return (
      <div style={publicPage}>
        <div style={publicCard}>
          <h1>KronoPay</h1>

          <h2>
            {
              publicInvoice.customerName
            }
          </h2>

          <p>
            <strong>
              Belopp:
            </strong>{" "}
            {
              publicInvoice.amount
            }{" "}
            kr
          </p>

          <p>
            <strong>
              Förfallodatum:
            </strong>{" "}
            {publicInvoice.deadline ||
              "-"}
          </p>

          <p>
            <strong>
              Status:
            </strong>{" "}
            {publicInvoice.paid
              ? "Betald"
              : "Obetald"}
          </p>

          {!publicInvoice.paid && (
            <button
              onClick={() =>
                payWithStripe(
                  publicInvoice._id
                )
              }
              style={payButton}
            >
              Betala med Stripe
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={publicPage}>
        <div style={publicCard}>
          <h1>KronoPay</h1>

          <h2>
            {authMode === "login"
              ? "Logga in"
              : "Skapa konto"}
          </h2>

          <form
            onSubmit={handleAuth}
          >
            <input
              type="email"
              placeholder="Email"
              value={
                authForm.email
              }
              onChange={(e) =>
                setAuthForm({
                  ...authForm,

                  email:
                    e.target.value,
                })
              }
              style={input}
              required
            />

            <input
              type="password"
              placeholder="Lösenord"
              value={
                authForm.password
              }
              onChange={(e) =>
                setAuthForm({
                  ...authForm,

                  password:
                    e.target.value,
                })
              }
              style={input}
              required
            />

            <button
              style={
                primaryButton
              }
            >
              {authMode ===
              "login"
                ? "Logga in"
                : "Registrera"}
            </button>
          </form>

          <button
            onClick={() =>
              setAuthMode(
                authMode ===
                  "login"
                  ? "register"
                  : "login"
              )
            }
            style={{
              ...topButton,

              marginTop: 12,

              width: "100%",
            }}
          >
            {authMode ===
            "login"
              ? "Skapa konto"
              : "Har redan konto?"}
          </button>

          {message && (
            <div
              style={
                messageBox
              }
            >
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={topbar}>
        <div>
          <h1
            style={{
              margin: 0,
            }}
          >
            KronoPay
          </h1>

          <p
            style={{
              marginTop: 6,

              color:
                "#cbd5e1",
            }}
          >
            Fakturor,
            kundlänkar och
            betalningar
          </p>
        </div>

        <div
          style={{
            display: "flex",

            gap: 10,

            flexWrap:
              "wrap",
          }}
        >
          <button
            onClick={
              fetchInvoices
            }
            style={topButton}
          >
            Uppdatera
          </button>

          <button
            onClick={
              exportCSV
            }
            style={{
              ...topButton,

              background:
                "#0f766e",
            }}
          >
            Export CSV
          </button>

          <button
            onClick={() => {
              localStorage.removeItem(
                "token"
              );

              setToken("");
            }}
            style={{
              ...topButton,

              background:
                "#dc2626",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const page = {
  background: "#f3f4f6",
  minHeight: "100vh",
  padding: 30,
  fontFamily: "Arial",
};

const publicPage = {
  background: "#f3f4f6",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
};

const publicCard = {
  background: "white",
  padding: 40,
  borderRadius: 20,
  width: 420,
  boxShadow:
    "0 2px 15px rgba(0,0,0,0.08)",
};

const payButton = {
  width: "100%",
  marginTop: 20,
  padding: 15,
  border: "none",
  borderRadius: 10,
  background: "#635bff",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const topbar = {
  background: "#111827",
  color: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 25,
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
};

const topButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: 8,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

const primaryButton = {
  width: "100%",
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: 14,
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};

const messageBox = {
  marginTop: 20,
  background: "#dbeafe",
  padding: 14,
  borderRadius: 10,
};