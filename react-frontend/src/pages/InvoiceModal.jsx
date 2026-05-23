export default function InvoiceModal({
  invoice,
  onClose,
}) {
  if (!invoice) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={title}>
            Faktura Detaljer
          </h2>

          <button
            onClick={onClose}
            style={closeBtn}
          >
            ✕
          </button>
        </div>

        <div style={content}>
          <div style={row}>
            <strong>Kund:</strong>

            <span>
              {invoice.customerName}
            </span>
          </div>

          <div style={row}>
            <strong>Email:</strong>

            <span>
              {invoice.customerEmail}
            </span>
          </div>

          <div style={row}>
            <strong>Belopp:</strong>

            <span>
              {invoice.amount} kr
            </span>
          </div>

          <div style={row}>
            <strong>Status:</strong>

            <span>
              {invoice.paid
                ? "Betald"
                : "Obetald"}
            </span>
          </div>

          <div style={row}>
            <strong>Deadline:</strong>

            <span>
              {invoice.deadline}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal = {
  width: 500,
  background: "white",
  borderRadius: 24,
  padding: 24,
  boxShadow:
    "0 12px 40px rgba(0,0,0,0.2)",
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const title = {
  margin: 0,
  color: "#0f172a",
};

const closeBtn = {
  border: "none",
  background: "#ef4444",
  color: "white",
  width: 36,
  height: 36,
  borderRadius: 10,
  cursor: "pointer",
};

const content = {
  display: "grid",
  gap: 18,
};

const row = {
  display: "flex",
  justifyContent:
    "space-between",
  color: "#334155",
};