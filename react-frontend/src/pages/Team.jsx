export default function Team() {
  const members = [
    {
      name: "Hassan",
      role: "Admin",
      email: "admin@kronopay.com",
    },
    {
      name: "Anna",
      role: "Support",
      email: "anna@kronopay.com",
    },
    {
      name: "Erik",
      role: "Finance",
      email: "erik@kronopay.com",
    },
  ];

  return (
    <div style={page}>
      <h1 style={title}>Team Members</h1>

      <div style={grid}>
        {members.map((member, index) => (
          <div key={index} style={card}>
            <div style={avatar}>
              {member.name.charAt(0)}
            </div>

            <h2 style={name}>
              {member.name}
            </h2>

            <p style={role}>
              {member.role}
            </p>

            <p style={email}>
              {member.email}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const page = {
  padding: 28,
};

const title = {
  marginTop: 0,
  color: "#0f172a",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(240px,1fr))",
  gap: 20,
};

const card = {
  background: "white",
  borderRadius: 24,
  padding: 24,
  textAlign: "center",
  boxShadow:
    "0 12px 30px rgba(15,23,42,0.08)",
};

const avatar = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  background: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: "bold",
  margin: "0 auto 16px",
};

const name = {
  margin: 0,
  color: "#0f172a",
};

const role = {
  color: "#2563eb",
  fontWeight: "bold",
};

const email = {
  color: "#64748b",
};