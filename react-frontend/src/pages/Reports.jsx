export default function Reports() {
  const stats = [
    {
      title: "Månadsintäkter",
      value: "24 500 kr",
    },
    {
      title: "Betalda fakturor",
      value: "18",
    },
    {
      title: "Obetalda fakturor",
      value: "4",
    },
    {
      title: "Påminnelser skickade",
      value: "12",
    },
  ];

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Rapporter</h1>
          <p style={subtitle}>
            Statistik, betalningar och fakturadata
          </p>
        </div>

        <button style={button}>Exportera PDF</button>
      </div>

      <div style={grid}>
        {stats.map((item) => (
          <div key={item.title} style={card}>
            <p style={cardLabel}>{item.title}</p>
            <h2 style={cardValue}>{item.value}</h2>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={panelTitle}>Intäktsöversikt</h2>

        <div style={chartPlaceholder}>
          Charts kommer här senare
        </div>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const card = {
  background: "white",
  padding: 22,
  borderRadius: 20,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
};

const cardLabel = {
  margin: 0,
  color: "#64748b",
  fontSize: 14,
};

const cardValue = {
  margin: "10px 0 0",
  fontSize: 28,
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

const chartPlaceholder = {
  height: 320,
  borderRadius: 18,
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  fontWeight: "bold",
};