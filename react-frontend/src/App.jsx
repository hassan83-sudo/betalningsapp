import React, { useEffect, useState } from "react";
import Customers from "./pages/Customers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [invoices, setInvoices] = useState([]);
  const [publicInvoice, setPublicInvoice] = useState(null);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
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
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const invoiceId = params.get("invoice");

      if (invoiceId) {
        const res = await fetch(`${API_URL}/api/public/invoice/${invoiceId}`);
        const data = await res.json();
        setPublicInvoice(data);
        return;
      }

      if (token) fetchInvoices();
    }

    init();
  }, [token]);

  async function fetchInvoices() {
    try {
      const res = await fetch(`${API_URL}/api/invoices`);
      const data = await res.json();
      setInvoices(data);
    } catch {
      setMessage("Kunde inte hämta fakturor");
    }
  }

  async function handleAuth(e) {
    e.preventDefault();

    const endpoint = authMode === "login" ? "login" : "register";

    const res = await fetch(`${API_URL}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authForm),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Auth error");
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setMessage("Inloggad");
      return;
    }

    setMessage("Konto skapat. Logga in nu.");
    setAuthMode("login");
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function createInvoice(e) {
    e.preventDefault();

    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      amount: Number(form.amount),
      deadline: form.deadline,
    };

    const res = await fetch(`${API_URL}/api/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage("Kunde inte skapa faktura");
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

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const unpaidInvoices = invoices.filter((invoice) => !invoice.paid);
  const paidInvoices = invoices.filter((invoice) => invoice.paid);

  const unpaidAmount = unpaidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const paidPercentage = invoices.length
    ? Math.round((paidInvoices.length / invoices.length) * 100)
    : 0;

  const progressFillDynamic = {
    height: "100%",
    width: `${paidPercentage}%`,
    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const name = invoice.customerName || "";
    const email = invoice.customerEmail || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && invoice.paid) ||
      (filter === "unpaid" && !invoice.paid);

    return matchesSearch && matchesFilter;
  });

  if (page === "customers") {
    return <Customers />;
  }

  return (
    <div style={appShell}>
      <aside style={sidebar}>
        <div style={brandBox}>
          <div style={brandIcon}>K</div>

          <div>
            <h2 style={brandTitle}>KronoPay</h2>
            <p style={brandSub}>Admin</p>
          </div>
        </div>

        <nav style={nav}>
          <div
            onClick={() => setPage("dashboard")}
            style={page === "dashboard" ? navItemActive : navItem}
          >
            Dashboard
          </div>

          <div
            onClick={() => setPage("customers")}
            style={page === "customers" ? navItemActive : navItem}
          >
            Kunder
          </div>
        </nav>
      </aside>

      <main style={main}>
        <header style={header}>
          <div>
            <h1 style={pageTitle}>Dashboard</h1>
            <p style={pageSub}>Fakturor, kundlänkar och betalningar</p>
          </div>
        </header>

        <section style={statsGrid}>
          <div style={statCard}>
            <p style={statLabel}>Totalt fakturabelopp</p>
            <h2 style={statValue}>{totalAmount} kr</h2>
          </div>

          <div style={statCard}>
            <p style={statLabel}>Obetalt belopp</p>
            <h2 style={statValue}>{unpaidAmount} kr</h2>
          </div>

          <div style={statCard}>
            <p style={statLabel}>Obetalda fakturor</p>
            <h2 style={statValue}>{unpaidInvoices.length}</h2>
          </div>

          <div style={statCard}>
            <p style={statLabel}>Betalda fakturor</p>
            <h2 style={statValue}>{paidInvoices.length}</h2>
          </div>
        </section>

        <div style={chartCard}>
          <h2 style={{ marginTop: 0 }}>Betalningsstatus</h2>

          <p style={{ color: "#64748b" }}>
            {paidInvoices.length} av {invoices.length} fakturor betalda
          </p>

          <div style={progressBar}>
            <div style={progressFillDynamic}></div>
          </div>
        </div>

        <section style={contentGrid}>
          <div style={panel}>
            <h2 style={panelTitle}>Skapa faktura</h2>

            <form onSubmit={createInvoice}>
              <input
                name="customerName"
                placeholder="Kundnamn"
                value={form.customerName}
                onChange={handleChange}
                style={input}
                required
              />

              <input
                name="customerEmail"
                placeholder="Kund-email"
                type="email"
                value={form.customerEmail}
                onChange={handleChange}
                style={input}
                required
              />

              <input
                name="amount"
                type="number"
                placeholder="Belopp"
                value={form.amount}
                onChange={handleChange}
                style={input}
                required
              />

              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                style={input}
                required
              />

              <button style={primaryButton}>Skapa faktura</button>
            </form>
          </div>

          <div style={panel}>
            <div style={listHeader}>
              <h2 style={panelTitle}>Fakturor</h2>

              <div style={toolbar}>
                <input
                  placeholder="Sök kund eller email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={searchInput}
                />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={select}
                >
                  <option value="all">Alla</option>
                  <option value="unpaid">Obetalda</option>
                  <option value="paid">Betalda</option>
                </select>
              </div>
            </div>

            {filteredInvoices.length === 0 && (
              <div style={emptyBox}>Inga fakturor matchar sökningen.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const appShell = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  minHeight: "100vh",
  background: "#eef2f7",
  fontFamily: "Inter, Arial, sans-serif",
};

const sidebar = {
  background: "#0f172a",
  color: "white",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 28,
};

const brandBox = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const brandIcon = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: 22,
};

const brandTitle = {
  margin: 0,
  fontSize: 20,
};

const brandSub = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
};

const nav = {
  display: "grid",
  gap: 10,
};

const navItem = {
  padding: "12px 14px",
  borderRadius: 12,
  color: "#cbd5e1",
  cursor: "pointer",
};

const navItemActive = {
  padding: "12px 14px",
  borderRadius: 12,
  background: "#1d4ed8",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const main = {
  padding: 28,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const pageTitle = {
  margin: 0,
  fontSize: 32,
  color: "#0f172a",
};

const pageSub = {
  margin: "6px 0 0",
  color: "#64748b",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const statCard = {
  background: "white",
  padding: 22,
  borderRadius: 20,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
};

const statLabel = {
  margin: 0,
  color: "#64748b",
  fontSize: 14,
};

const statValue = {
  margin: "10px 0 0",
  color: "#0f172a",
};

const chartCard = {
  background: "white",
  padding: 24,
  borderRadius: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  marginBottom: 24,
};

const progressBar = {
  height: 12,
  borderRadius: 999,
  background: "#e5e7eb",
  overflow: "hidden",
  marginTop: 10,
};

const contentGrid = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 22,
};

const panel = {
  background: "white",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
};

const panelTitle = {
  marginTop: 0,
  color: "#0f172a",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  marginBottom: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
};

const primaryButton = {
  width: "100%",
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: 14,
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: "bold",
};

const listHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  marginBottom: 16,
};

const toolbar = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const searchInput = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
};

const select = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
};

const emptyBox = {
  padding: 30,
  textAlign: "center",
  color: "#64748b",
  background: "#f8fafc",
  borderRadius: 16,
};