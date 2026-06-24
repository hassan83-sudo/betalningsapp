import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onLogin({ email, password });
    } catch (loginError) {
      setError(loginError.message || "Inloggningen misslyckades");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-badge">KronoPay Demo</div>

        <h1>Skuldkoll för inkassoärenden</h1>
        <p>
          Logga in i demoläge för att se en samlad översikt över skulder,
          inkassobolag, status, risknivåer och möjliga avbetalningsplaner.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Personnummer eller e-post
            <input
              type="text"
              placeholder="Demo: hassan@example.se"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Lösenord
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Loggar in..." : "Logga in i demo"}
          </button>
        </form>

        <p className="login-note">
          Riktig BankID-inloggning och integrationer mot inkassobolag kopplas i
          en senare version.
        </p>
      </section>
    </main>
  );
}
