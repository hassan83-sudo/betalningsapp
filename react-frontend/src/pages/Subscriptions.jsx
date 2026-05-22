export default function Subscriptions() {
  const plans = [
    {
      name: "Starter",
      price: "99 kr/mån",
      features: [
        "10 fakturor",
        "Email-påminnelser",
        "PDF-export",
      ],
      color: "#2563eb",
    },
    {
      name: "Pro",
      price: "299 kr/mån",
      features: [
        "Obegränsade fakturor",
        "Stripe payments",
        "Analytics",
        "Priority support",
      ],
      color: "#7c3aed",
    },
    {
      name: "Business",
      price: "799 kr/mån",
      features: [
        "Multi-user",
        "BankID",
        "API access",
        "Advanced reports",
      ],
      color: "#0f766e",
    },
  ];

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Subscriptions</h1>
          <p style={subtitle}>
            Hantera Stripe-planer och abonnemang
          </p>
        </div>
      </div>

      <div style={grid}>
        {plans.map((plan) => (
          <div key={plan.name} style={card}>
            <div
              style={{
                ...topBar,
                background: plan.color,
              }}
            />

            <h2 style={planName}>{plan.name}</h2>

            <h3 style={price}>{plan.price}</h3>

            <div style={featureList}>
              {plan.features.map((feature) => (
                <div key={feature} style={featureItem}>
                  ✓ {feature}
                </div>
              ))}
            </div>

            <button
              style={{
                ...button,
                background: plan.color,
              }}
            >
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
  marginBottom: 28,
};

const title = {
  margin: 0,
  fontSize: 32,
  color: "#0f172a",
};

const subtitle = {
  marginTop: 8,
  color: "#64748b",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 22,
};

const card = {
  background: "white",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
};

const topBar = {
  height: 8,
  borderRadius: 999,
  marginBottom: 22,
};

const planName = {
  margin: 0,
  color: "#0f172a",
};

const price = {
  fontSize: 34,
  marginTop: 14,
  marginBottom: 20,
  color: "#111827",
};

const featureList = {
  display: "grid",
  gap: 12,
  marginBottom: 24,
};

const featureItem = {
  color: "#475569",
};

const button = {
  width: "100%",
  border: "none",
  color: "white",
  padding: 14,
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 15,
};