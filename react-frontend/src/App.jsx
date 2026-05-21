import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [invoices, setInvoices] = useState([]);
  const [publicInvoice, setPublicInvoice] = useState(null);
  const [message, setMessage] = useState("");
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
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const invoiceId = params.get("invoice");
      const paidId = params.get("paid");
      const cancelled = params.get("cancelled");

      if (paidId) {
        await fetch(`${API_URL}/api/invoices/${paidId}/pay`, {
          method: "PATCH",
        });
        setMessage("Stripe-betalning klar.");
        window.history.replaceState({}, "", window.location.pathname);
      }

      if (cancelled) {
        setMessage("Stripe-betalning avbröts.");
        window.history.replaceState({}, "", window.location.pathname);
      }

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
      name: form.customerName,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      amount: Number(form.amount),
      deadline: form.deadline,
      dueDate: form.deadline,
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

  async function payWithStripe(id) {
    const res = await fetch(`${API_URL}/api/invoices/${id}/create-checkout-session`, {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setMessage("Stripe-länk kunde inte skapas");
    }
  }

  async function markPaid(id) {
    await fetch(`${API_URL}/api/invoices/${id}/pay`, {
      method: "PATCH",
    });
    setMessage("Faktura markerad som betald");
    fetchInvoices();
  }

  async function sendReminder(id) {
    const res = await fetch(`${API_URL}/api/invoices/${id}/send-reminder`, {
      method: "POST",
    });
    setMessage(res.ok ? "Påminnelse skickad" : "Påminnelse misslyckades");
  }

  async function sendAllReminders() {
    const res = await fetch(`${API_URL}/api/invoices/send-reminders`, {
      method: "POST",
    });
    setMessage(res.ok ? "Alla påminnelser skickade" : "Kunde inte skicka alla");
  }

  async function deleteInvoice(id) {
    await fetch(`${API_URL}/api/invoices/${id}`, {
      method: "DELETE",
    });
    setMessage("Faktura borttagen");
    fetchInvoices();
  }

  function openPdf(id) {
    window.open(`${API_URL}/api/invoices/${id}/pdf`, "_blank");
  }

  function copyCustomerLink(id) {
    const url = `${window.location.origin}/?invoice=${id}`;
    navigator.clipboard.writeText(url);
    setMessage("Kundlänk kopierad");
  }

  function exportCSV() {
    const headers = ["Kund", "Email", "Belopp", "Förfallodatum", "Status"];
    const rows = invoices.map((invoice) => [
      invoice.customerName || invoice.name || "",
      invoice.customerEmail || "",
      invoice.amount || 0,
      invoice.deadline || invoice.dueDate || "",
      invoice.paid ? "Betald" : "Obetald",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "kronopay-fakturor.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const unpaidInvoices = invoices.filter((invoice) => !invoice.paid);
  const paidInvoices = invoices.filter((invoice) => invoice.paid);
  const unpaidAmount = unpaidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

  const filteredInvoices = invoices.filter((invoice) => {
    const name = invoice.customerName || invoice.name || "";
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

  if (publicInvoice) {
    return (
      <div style={publicPage}>
        <div style={publicCard}>
          <div style={logo}>KronoPay</div>
          <h1 style={publicTitle}>{publicInvoice.customerName}</h1>

          <div style={publicInfo}>
            <p><strong>Belopp:</strong> {publicInvoice.amount} kr</p>
            <p><strong>Förfallodatum:</strong> {publicInvoice.deadline || "-"}</p>
            <p><strong>Status:</strong> {publicInvoice.paid ? "Betald" : "Obetald"}</p>
          </div>

          {!publicInvoice.paid && (
            <button onClick={() => payWithStripe(publicInvoice._id)} style={payButton}>
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
          <div style={logo}>KronoPay</div>
          <h1 style={publicTitle}>{authMode === "login" ? "Logga in" : "Skapa konto"}</h1>

          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              style={input}
              required
            />

            <input
              type="password"
              placeholder="Lösenord"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              style={input}
              required
            />

            <button style={primaryButton}>
              {authMode === "login" ? "Logga in" : "Registrera"}
            </button>
          </form>

          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            style={secondaryFullButton}
          >
            {authMode === "login" ? "Skapa konto" : "Har redan konto?"}
          </button>

          {message && <div style={messageBox}>{message}</div>}
        </div>
      </div>
    );
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
          <div style={navItemActive}>Dashboard</div>
          <div style={navItem}>Fakturor</div>
          <div style={navItem}>Kunder</div>
          <div style={navItem}>Rapporter</div>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken("");
          }}
          style={logoutButton}
        >
          Logout
        </button>
      </aside>

      <main style={main}>
        <header style={header}>
          <div>
            <h1 style={pageTitle}>Dashboard</h1>
            <p style={pageSub}>Fakturor, kundlänkar och betalningar</p>
          </div>

          <div style={headerActions}>
            <button onClick={fetchInvoices} style={topButton}>Uppdatera</button>
            <button onClick={exportCSV} style={greenButton}>Export CSV</button>
          </div>
        </header>

        {message && <div style={messageBoxTop}>{message}</div>}

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

            <button onClick={sendAllReminders} style={orangeFullButton}>
              Skicka alla påminnelser
            </button>
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

            {filteredInvoices.map((invoice) => {
              const id = invoice._id || invoice.id;

              return (
                <div key={id} style={invoiceCard}>
                  <div style={invoiceTop}>
                    <div>
                      <h3 style={invoiceName}>{invoice.customerName || invoice.name}</h3>
                      <p style={invoiceEmail}>{invoice.customerEmail || "-"}</p>
                    </div>

                    <span
                      style={{
                        ...badge,
                        background: invoice.paid ? "#dcfce7" : "#fee2e2",
                        color: invoice.paid ? "#166534" : "#991b1b",
                      }}
                    >
                      {invoice.paid ? "Betald" : "Obetald"}
                    </span>
                  </div>

                  <div style={invoiceMeta}>
                    <div>
                      <p style={metaLabel}>Belopp</p>
                      <strong>{invoice.amount} kr</strong>
                    </div>

                    <div>
                      <p style={metaLabel}>Förfallodatum</p>
                      <strong>{invoice.deadline || invoice.dueDate || "-"}</strong>
                    </div>
                  </div>

                  <div style={buttonRow}>
                    {!invoice.paid && (
                      <>
                        <button onClick={() => payWithStripe(id)} style={stripeButton}>Stripe</button>
                        <button onClick={() => markPaid(id)} style={paidButton}>Betald</button>
                        <button onClick={() => sendReminder(id)} style={orangeButton}>Påminnelse</button>
                      </>
                    )}

                    <button onClick={() => openPdf(id)} style={tealButton}>PDF</button>
                    <button onClick={() => copyCustomerLink(id)} style={blueButton}>Kundlänk</button>
                    <button onClick={() => deleteInvoice(id)} style={redButton}>Ta bort</button>
                  </div>
                </div>
              );
            })}

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
};

const navItemActive = {
  padding: "12px 14px",
  borderRadius: 12,
  background: "#1d4ed8",
  color: "white",
  fontWeight: "bold",
};

const logoutButton = {
  marginTop: "auto",
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: 12,
  borderRadius: 12,
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

const headerActions = {
  display: "flex",
  gap: 10,
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
  height: "fit-content",
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
  fontSize: 14,
};

const searchInput = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 14,
  minWidth: 240,
};

const select = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 14,
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

const secondaryFullButton = {
  width: "100%",
  border: "none",
  background: "#334155",
  color: "white",
  padding: 14,
  borderRadius: 12,
  cursor: "pointer",
};

const orangeFullButton = {
  ...primaryButton,
  background: "#ea580c",
  marginTop: 12,
};

const topButton = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "11px 15px",
  borderRadius: 12,
  cursor: "pointer",
};

const greenButton = {
  ...topButton,
  background: "#0f766e",
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

const invoiceCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  marginBottom: 16,
  background: "#ffffff",
};

const invoiceTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
};

const invoiceName = {
  margin: 0,
  color: "#0f172a",
};

const invoiceEmail = {
  margin: "5px 0 0",
  color: "#64748b",
};

const badge = {
  padding: "7px 12px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 13,
};

const invoiceMeta = {
  display: "flex",
  gap: 40,
  marginTop: 18,
};

const metaLabel = {
  margin: "0 0 5px",
  color: "#64748b",
  fontSize: 13,
};

const buttonRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 18,
};

const smallButtonBase = {
  border: "none",
  color: "white",
  padding: "9px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};

const stripeButton = {
  ...smallButtonBase,
  background: "#635bff",
};

const paidButton = {
  ...smallButtonBase,
  background: "#16a34a",
};

const orangeButton = {
  ...smallButtonBase,
  background: "#ea580c",
};

const tealButton = {
  ...smallButtonBase,
  background: "#0f766e",
};

const blueButton = {
  ...smallButtonBase,
  background: "#2563eb",
};

const redButton = {
  ...smallButtonBase,
  background: "#dc2626",
};

const publicPage = {
  background: "#eef2f7",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  fontFamily: "Inter, Arial, sans-serif",
};

const publicCard = {
  background: "white",
  padding: 36,
  borderRadius: 24,
  width: 430,
  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
};

const logo = {
  fontWeight: "bold",
  color: "#2563eb",
  marginBottom: 12,
};

const publicTitle = {
  marginTop: 0,
  color: "#0f172a",
};

const publicInfo = {
  color: "#334155",
  lineHeight: 1.7,
};

const payButton = {
  ...primaryButton,
  background: "#635bff",
  marginTop: 14,
};

const messageBox = {
  marginTop: 16,
  background: "#dbeafe",
  color: "#1e3a8a",
  padding: 13,
  borderRadius: 12,
};

const messageBoxTop = {
  background: "#dbeafe",
  color: "#1e3a8a",
  padding: 13,
  borderRadius: 12,
  marginBottom: 18,
};

const emptyBox = {
  padding: 30,
  textAlign: "center",
  color: "#64748b",
  background: "#f8fafc",
  borderRadius: 16,
};
