export default function Notifications() {
  const notifications = [
    {
      title: "Faktura betald",
      text: "Anna Andersson betalade 4 500 kr",
      time: "2 min sedan",
    },
    {
      title: "Ny kund registrerad",
      text: "Johan Svensson skapades",
      time: "10 min sedan",
    },
    {
      title: "Prenumeration aktiv",
      text: "Premium-plan aktiverad",
      time: "1 tim sedan",
    },
  ];

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Notifications</h1>

          <p style={subtitle}>
            Händelser och uppdateringar i systemet
          </p>
        </div>
      </div>

      <div style={panel}>
        {notifications.map((item, index) => (
          <div key={index} style={card}>
            <div>
              <h3 style={cardTitle}>{item.title}</h3>
              <p style={cardText}>{item.text}</p>
            </div>

            <span style={time}>{item.time}</span>
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

const panel = {
  display: "grid",
  gap: 16,
};

const card = {
  background: "white",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const cardTitle = {
  margin: 0,
  color: "#0f172a",
};

const cardText = {
  margin: "6px 0 0",
  color: "#64748b",
};

const time = {
  color: "#94a3b8",
  fontSize: 13,
};