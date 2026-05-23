export default function Analytics() {
  const stats = [
    {
      label: "Månadsintäkt",
      value: "48 200 kr",
      progress: "78%",
    },
    {
      label: "Aktiva kunder",
      value: "124",
      progress: "65%",
    },
    {
      label: "Betalningar",
      value: "92%",
      progress: "92%",
    },
  ];

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Analytics</h1>

          <p style={subtitle}>
            Statistik och affärsdata
          </p>
        </div>
      </div>

      <div style={grid}>
        {stats.map((item, index) => (
          <div key={index} style={card}>
            <p style={label}>{item.label}</p>

            <h2 style={value}>{item.value}</h2>

            <div style={progressBar}>
              <div
                style={{
                  ...progressFill,
                  width: item.progress,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const page = {
  padding: 28,
};

const header = {
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

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const card = {
  background: "white",
  borderRadius: 22,
  padding: 24,
  boxShadow:
    "0 12px 30px rgba(15,23,42,0.08)",
};

const label = {
  margin: 0,
  color: "#64748b",
};

const value = {
  margin: "12px 0",
  color: "#0f172a",
  fontSize: 32,
};

const progressBar = {
  width: "100%",
  height: 12,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background:
    "linear-gradient(90deg,#2563eb,#7c3aed)",
};