export default function Billing() {
  const plans = [
    {
      name: "Starter",
      price: "99 kr/mån",
      features: [
        "5 kunder",
        "10 fakturor",
        "Emailpåminnelser",
      ],
    },
    {
      name: "Pro",
      price: "299 kr/mån",
      features: [
        "Obegränsade kunder",
        "Analytics",
        "Automatiska påminnelser",
      ],
    },
    {
      name: "Enterprise",
      price: "999 kr/mån",
      features: [
        "Team access",
        "API access",
        "Prioriterad support",
      ],
    },
  ];

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Billing</h1>

          <p style={subtitle}>
            Hantera abonnemang och betalningar
          </p>
        </div>
      </div>

      <div style={grid}>
        {plans.map((plan, index) => (
          <div key={index} style={card}>
            <h2 style={planTitle}>
              {plan.name}
            </h2>

            <p style={price}>
              {plan.price}
            </p>

            <div style={featureList}>
              {plan.features.map(
                (feature, i) => (
                  <div
                    key={i}
                    style={feature}
                  >
                    ✓ {feature}
                  </div>
                )
              )}
            </div>

            <button style={button}>
              Välj plan
            </button>
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
  borderRadius: 24,
  padding: 24,
  boxShadow:
    "0 12px 30px rgba(15,23,42,0.08)",
};

const planTitle = {
  marginTop: 0,
  color: "#0f172a",
};

const price = {
  fontSize: 30,
  fontWeight: "bold",
  color: "#2563eb",
};

const featureList = {
  marginTop: 20,
  marginBottom: 20,
  display: "grid",
  gap: 10,
};

const feature = {
  color: "#475569",
};

const button = {
  width: "100%",
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: 14,
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: "bold",
};