import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import api from "./api";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await api.post("/api/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("isAdmin", res.data.isAdmin);

      if (res.data.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/customer");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="center">
      <form className="card" onSubmit={handleLogin}>
        <h1>Logga in</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Logga in</button>

        <p>
          Har du inget konto?
          <Link to="/register"> Registrera</Link>
        </p>
      </form>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    try {
      await api.post("/api/register", {
        email,
        password,
        isAdmin,
      });

      alert("Konto skapat");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  }

  return (
    <div className="center">
      <form className="card" onSubmit={handleRegister}>
        <h1>Registrera</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />

          Admin
        </label>

        <button type="submit">Skapa konto</button>

        <p>
          Har du redan konto?
          <Link to="/login"> Logga in</Link>
        </p>
      </form>
    </div>
  );
}

function Customer() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);

  async function loadInvoices() {
    try {
      const res = await api.get("/api/invoices");
      setInvoices(res.data);

    } catch {
      alert("Kunde inte hämta fakturor");
    }
  }

  async function payInvoice(id) {
    try {
      await api.post(`/api/invoices/pay/${id}`);
      loadInvoices();

    } catch (err) {
      alert(err.response?.data?.message || "Betalning misslyckades");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="page">
      <nav className="navbar">
        <h2>Customer Dashboard</h2>

        <button onClick={logout}>
          Logga ut
        </button>
      </nav>

      <div className="container">
        <div className="grid">
          {invoices.map((invoice) => (
            <div className="card" key={invoice._id}>
              <h2>{invoice.name}</h2>

              <p>
                Faktura: {invoice.invoiceNumber}
              </p>

              <p>
                Belopp: {invoice.amount} kr
              </p>

              <p>
                Status:
                {" "}
                {invoice.paid ? "Betald" : "Obetald"}
              </p>

              {!invoice.paid && (
                <button
                  onClick={() => payInvoice(invoice._id)}
                >
                  Betala
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  async function loadInvoices() {
    try {
      const res = await api.get("/api/invoices");
      setInvoices(res.data);

    } catch {
      alert("Kunde inte hämta fakturor");
    }
  }

  async function createInvoice(e) {
    e.preventDefault();

    try {
      await api.post("/api/invoices", {
        userId,
        name,
        amount: Number(amount),
      });

      setUserId("");
      setName("");
      setAmount("");

      loadInvoices();

    } catch (err) {
      alert(err.response?.data?.message || "Kunde inte skapa faktura");
    }
  }

  async function deleteInvoice(id) {
    try {
      await api.delete(`/api/invoices/${id}`);
      loadInvoices();

    } catch {
      alert("Delete failed");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="page">
      <nav className="navbar">
        <h2>Admin Dashboard</h2>

        <button onClick={logout}>
          Logga ut
        </button>
      </nav>

      <div className="container">

        <form
          className="card form"
          onSubmit={createInvoice}
        >
          <h2>Skapa faktura</h2>

          <input
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <input
            placeholder="Namn"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Belopp"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button type="submit">
            Skapa faktura
          </button>
        </form>

        <div className="grid">
          {invoices.map((invoice) => (
            <div className="card" key={invoice._id}>
              <h2>{invoice.name}</h2>

              <p>User: {invoice.userId}</p>

              <p>
                Faktura:
                {" "}
                {invoice.invoiceNumber}
              </p>

              <p>
                Belopp:
                {" "}
                {invoice.amount} kr
              </p>

              <p>
                Status:
                {" "}
                {invoice.paid ? "Betald" : "Obetald"}
              </p>

              <button
                className="danger"
                onClick={() => deleteInvoice(invoice._id)}
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;