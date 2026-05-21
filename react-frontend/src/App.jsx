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

        setMessage("Stripe-betalning klar. Fakturan är markerad som betald.");
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

      fetchInvoices();
    }

    init();
  }, []);

  async function fetchInvoices() {
    try {
      const res = await fetch(`${API_URL}/api/invoices`);
      const data = await res.json();
      setInvoices(data);
    } catch {
      setMessage("Kunde inte hämta fakturor");
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
      headers: {
        "Content-Type": "application/json",
      },
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
    const res = await fetch(
      `${API_URL}/api/invoices/${id}/create-checkout-session`,
      {
        method: "POST",
      }
    );

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

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "kronopay-fakturor.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const unpaidInvoices = invoices.filter((invoice) => !invoice.paid);
  const paidInvoices = invoices.filter((invoice) => invoice.paid);

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
          <h1>KronoPay</h1>

          <h2>{publicInvoice.customerName}</h2>

          <p>
            <strong>Belopp:</strong> {publicInvoice.amount} kr
          </p>

          <p>
            <strong>Förfallodatum:</strong> {publicInvoice.deadline || "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {publicInvoice.paid ? "Betald" : "Obetald"}
          </p>

          {!publicInvoice.paid && (
            <button
              onClick={() => payWithStripe(publicInvoice._id)}
              style={payButton}
            >
              Betala med Stripe
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={topbar}>
        <div>
          <h1 style={{ margin: 0 }}>KronoPay</h1>

          <p style={{ marginTop: 6, color: "#cbd5e1" }}>
            Fakturor, kundlänkar och betalningar
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={fetchInvoices} style={topButton}>
            Uppdatera
          </button>

          <button
            onClick={exportCSV}
            style={{
              ...topButton,
              background: "#0f766e",
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div style={statsGrid}>
        <div style={statsCard}>
          <p style={statsLabel}>Totalt fakturabelopp</p>
          <h2>{totalAmount} kr</h2>
        </div>

        <div style={statsCard}>
          <p style={statsLabel}>Obetalda fakturor</p>
          <h2>{unpaidInvoices.length}</h2>
        </div>

        <div style={statsCard}>
          <p style={statsLabel}>Betalda fakturor</p>
          <h2>{paidInvoices.length}</h2>
        </div>
      </div>

      <div style={layout}>
        <div style={createCard}>
          <h2>Skapa faktura</h2>

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

          <button
            onClick={sendAllReminders}
            style={{
              ...primaryButton,
              background: "#ea580c",
              marginTop: 12,
            }}
          >
            Skicka alla påminnelser
          </button>

          {message && <div style={messageBox}>{message}</div>}
        </div>

        <div>
          <div style={toolbar}>
            <input
              placeholder="Sök kund eller email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...input,
                marginBottom: 0,
              }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={select}
            >
              <option value="all">Alla</option>
              <option value="paid">Betalda</option>
              <option value="unpaid">Obetalda</option>
            </select>
          </div>

          {filteredInvoices.map((invoice) => {
            const id = invoice._id || invoice.id;

            return (
              <div key={id} style={invoiceCard}>
                <div style={invoiceTop}>
                  <div>
                    <h3>{invoice.customerName || invoice.name}</h3>

                    <p style={emailText}>{invoice.customerEmail || "-"}</p>
                  </div>

                  <div
                    style={{
                      ...badge,
                      background: invoice.paid ? "#dcfce7" : "#fee2e2",
                      color: invoice.paid ? "#166534" : "#991b1b",
                    }}
                  >
                    {invoice.paid ? "Betald" : "Obetald"}
                  </div>
                </div>

                <div style={invoiceInfo}>
                  <div>
                    <strong>Belopp</strong>
                    <p>{invoice.amount} kr</p>
                  </div>

                  <div>
                    <strong>Förfallodatum</strong>
                    <p>{invoice.deadline || invoice.dueDate || "-"}</p>
                  </div>
                </div>

                <div style={buttonRow}>
                  {!invoice.paid && (
                    <>
                      <button
                        onClick={() => payWithStripe(id)}
                        style={{
                          ...smallButton,
                          background: "#635bff",
                        }}
                      >
                        Stripe
                      </button>

                      <button
                        onClick={() => markPaid(id)}
                        style={{
                          ...smallButton,
                          background: "#16a34a",
                        }}
                      >
                        Markera betald
                      </button>

                      <button
                        onClick={() => sendReminder(id)}
                        style={{
                          ...smallButton,
                          background: "#ea580c",
                        }}
                      >
                        Påminnelse
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => openPdf(id)}
                    style={{
                      ...smallButton,
                      background: "#0f766e",
                    }}
                  >
                    PDF
                  </button>

                  <button
                    onClick={() => copyCustomerLink(id)}
                    style={{
                      ...smallButton,
                      background: "#2563eb",
                    }}
                  >
                    Kopiera kundlänk
                  </button>

                  <button
                    onClick={() => deleteInvoice(id)}
                    style={{
                      ...smallButton,
                      background: "#dc2626",
                    }}
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            );
          })}

          {filteredInvoices.length === 0 && (
            <div style={emptyBox}>Inga fakturor matchar sökningen.</div>
          )}
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
  boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
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
  justifyContent: "space-between",
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

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 30,
};

const statsCard = {
  background: "white",
  padding: 25,
  borderRadius: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const statsLabel = {
  color: "#6b7280",
  marginBottom: 10,
};

const layout = {
  display: "grid",
  gridTemplateColumns: "350px 1fr",
  gap: 25,
};

const createCard = {
  background: "white",
  padding: 25,
  borderRadius: 16,
  height: "fit-content",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

const select = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  minWidth: 140,
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

const toolbar = {
  display: "grid",
  gridTemplateColumns: "1fr 150px",
  gap: 12,
  marginBottom: 20,
};

const invoiceCard = {
  background: "white",
  padding: 22,
  borderRadius: 16,
  marginBottom: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const invoiceTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const invoiceInfo = {
  display: "flex",
  gap: 40,
  marginTop: 20,
};

const badge = {
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: "bold",
  fontSize: 13,
  height: "fit-content",
};

const emailText = {
  color: "#6b7280",
};

const buttonRow = {
  display: "flex",
  gap: 10,
  marginTop: 20,
  flexWrap: "wrap",
};

const smallButton = {
  border: "none",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
};

const messageBox = {
  marginTop: 20,
  background: "#dbeafe",
  padding: 14,
  borderRadius: 10,
};

const emptyBox = {
  background: "white",
  padding: 25,
  borderRadius: 16,
  color: "#6b7280",
  textAlign: "center",
};