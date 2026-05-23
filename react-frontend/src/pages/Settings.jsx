import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: "KronoPay",
    email: "admin@kronopay.se",
    currency: "SEK",
    language: "Svenska",
  });

  function handleChange(e) {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Settings</h1>
          <p style={subtitle}>Hantera företagsprofil och appinställningar</p>
        </div>
      </div>

      <div style={panel}>
        <h2 style={panelTitle}>Företagsinställningar</h2>

        <input
          name="companyName"
          value={settings.companyName}
          onChange={handleChange}
          placeholder="Företagsnamn"
          style={input}
        />

        <input
          name="email"
          value={settings.email}
          onChange={handleChange}
          placeholder="Email"
          style={input}
        />

        <select
          name="currency"
          value={settings.currency}
          onChange={handleChange}
          style={input}
        >
          <option value="SEK">SEK</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>

        <select
          name="language"
          value={settings.language}
          onChange={handleChange}
          style={input}
        >
          <option value="Svenska">Svenska</option>
          <option value="English">English</option>
        </select>

        <button style={button}>Spara inställningar</button>
      </div>
    </div>
  );
}

const page = { padding: 28 };

const header = { marginBottom: 24 };

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
  background: "white",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  maxWidth: 520,
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