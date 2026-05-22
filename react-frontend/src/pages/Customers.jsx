import { useState } from "react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function addCustomer(e) {
    e.preventDefault();

    const newCustomer = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      active: true,
    };

    setCustomers([newCustomer, ...customers]);

    setForm({
      name: "",
      email: "",
      phone: "",
    });

    setShowForm(false);
  }

  function deleteCustomer(id) {
    setCustomers(customers.filter((customer) => customer.id !== id));
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Kunder</h1>
          <p style={subtitle}>Hantera kunder, emails och fakturahistorik</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} style={button}>
          {showForm ? "Stäng" : "Ny kund"}
        </button>
      </div>

      <div style={grid}>
        <div style={card}>
          <h3 style={cardTitle}>Totala kunder</h3>
          <p style={cardValue}>{customers.length}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Aktiva kunder</h3>
          <p style={cardValue}>{customers.length}</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Obetalda kunder</h3>
          <p style={cardValue}>0</p>
        </div>
      </div>

      {showForm && (
        <div style={panel}>
          <h2 style={panelTitle}>Lägg till kund</h2>

          <form onSubmit={addCustomer}>
            <input
              name="name"
              placeholder="Kundnamn"
              value={form.name}
              onChange={handleChange}
              style={input}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              style={input}
              required
            />

            <input
              name="phone"
              placeholder="Telefon"
              value={form.phone}
              onChange={handleChange}
              style={input}
            />

            <button style={saveButton}>Spara kund</button>
          </form>
        </div>
      )}

      <div style={panel}>
        <h2 style={panelTitle}>Kundlista</h2>

        {customers.length === 0 ? (
          <div style={empty}>Inga kunder ännu.</div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} style={customerRow}>
              <div>
                <h3 style={customerName}>{customer.name}</h3>
                <p style={customerInfo}>{customer.email}</p>
                <p style={customerInfo}>{customer.phone || "-"}</p>
              </div>

              <button
                onClick={() => deleteCustomer(customer.id)}
                style={deleteButton}
              >
                Ta bort
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const page = {
  padding: 28,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const title = {
  margin: 0,
  fontSize: 32,
  color: "#0f172a",
};

const subtitle = {
  margin: "6px 0 0",
  color: "#64748b",
};

const button = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: "bold",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const card = {
  background: "white",
  padding: 22,
  borderRadius: 20,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
};

const cardTitle = {
  margin: 0,
  color: "#64748b",
  fontSize: 14,
};

const cardValue = {
  margin: "10px 0 0",
  fontSize: 28,
  fontWeight: "bold",
  color: "#0f172a",
};

const panel = {
  background: "white",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  marginBottom: 24,
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

const saveButton = {
  width: "100%",
  border: "none",
  background: "#16a34a",
  color: "white",
  padding: 14,
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: "bold",
};

const empty = {
  padding: 30,
  textAlign: "center",
  color: "#64748b",
  background: "#f8fafc",
  borderRadius: 16,
};

const customerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
};

const customerName = {
  margin: 0,
  color: "#0f172a",
};

const customerInfo = {
  margin: "4px 0 0",
  color: "#64748b",
};

const deleteButton = {
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: "9px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
};