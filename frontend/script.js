const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API_URL = "http://127.0.0.1:3000/api/invoices";
window.currentInvoices = [];
let isSaving = false;

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatKr(value) {
  return `${safeNumber(value).toLocaleString("sv-SE")} kr`;
}

function getPriorityText(priority) {
  if (priority === "high") return "Hög prioritet";
  if (priority === "low") return "Låg prioritet";
  return "Medel prioritet";
}

function getPriorityClass(priority) {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-medium";
}

function priorityRank(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function calculateScore(invoice) {
  if (invoice.paid) return 0;
  return invoice.amount * 0.4 + invoice.monthlyPayment * 0.8 + priorityRank(invoice.priority) * 2500;
}

function loadInvoices() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const invoices = data.map(i => ({
        ...i,
        amount: safeNumber(i.amount),
        monthlyPayment: safeNumber(i.monthlyPayment),
        priority: i.priority || "medium",
        paid: Boolean(i.paid),
        requestedMoreTime: Boolean(i.requestedMoreTime)
      }));

      window.currentInvoices = invoices;
      renderInvoices(invoices);
    })
    .catch(err => console.error("Fel:", err));
}

function renderInvoices(data) {
  const list = document.getElementById("debtList");
  list.innerHTML = "";

  data.forEach(invoice => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${invoice.name}</strong><br>
        ${formatKr(invoice.amount)}<br>
        <span>
          ${invoice.paid ? "Betald" : "Ej betald"}
          ${invoice.requestedMoreTime ? " • Väntar på svar" : ""}
        </span>
      </div>

      <div>
        ${!invoice.paid ? `<button onclick="payInvoice('${invoice._id}')">Betala nu</button>` : ""}
        ${!invoice.paid ? `<button onclick="requestMoreTime('${invoice._id}')">Mer tid</button>` : ""}
        <button onclick="deleteInvoice('${invoice._id}')">Ta bort</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function saveInvoice() {
  const name = document.getElementById("name").value.trim();
  const amount = safeNumber(document.getElementById("amount").value);
  const monthlyPayment = safeNumber(document.getElementById("monthlyPayment").value);
  const priority = document.getElementById("priority").value;

  if (!name || amount <= 0) {
    alert("Fyll i namn och giltigt belopp");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, amount, monthlyPayment, priority })
  })
    .then(() => {
      loadInvoices();
      document.getElementById("name").value = "";
      document.getElementById("amount").value = "";
      document.getElementById("monthlyPayment").value = "";
    })
    .catch(err => console.error("Fel:", err));
}

function payInvoice(id) {
  fetch(`${API_URL}/pay/${id}`, { method: "POST" })
    .then(() => loadInvoices());
}

function requestMoreTime(id) {
  fetch(`${API_URL}/request-time/${id}`, {
    method: "POST"
  })
    .then(() => {
      alert("Förfrågan om mer tid skickad 👍");
      loadInvoices();
    })
    .catch(err => console.error("Fel:", err));
}

function deleteInvoice(id) {
  if (!confirm("Ta bort faktura?")) return;

  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => loadInvoices());
}

loadInvoices();