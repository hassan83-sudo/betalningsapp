export default function Customers() {
  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Kunder</h1>
          <p style={subtitle}>Hantera kunder, emails och fakturahistorik</p>
        </div>

        <button style={button}>Ny kund</button>
      </div>

      <div style={grid}>
        <div style={card}>
          <h3 style={cardTitle}>Totala kunder</h3>
          <p style={cardValue}>0</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Aktiva kunder</h3>
          <p style={cardValue}>0</p>
        </div>

        <div style={card}>
          <h3 style={cardTitle}>Obetalda kunder</h3>
          <p style={cardValue}>0</p>
        </div>
      </div>

      <div style={panel}>
        <h2 style={panelTitle}>Kundlista</h2>
        <div style={empty}>Inga kunder ännu.</div>
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
};

const panelTitle = {
  marginTop: 0,
  color: "#0f172a",
};

const empty = {
  padding: 30,
  textAlign: "center",
  color: "#64748b",
  background: "#f8fafc",
  borderRadius: 16,
};