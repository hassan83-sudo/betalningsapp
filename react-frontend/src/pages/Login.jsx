export default function Login({ onLogin }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-badge">KronoPay Demo</div>

        <h1>Skuldkoll för inkassoärenden</h1>
        <p>
          Logga in i demoläge för att se en samlad översikt över skulder,
          inkassobolag, status, risknivåer och möjliga avbetalningsplaner.
        </p>

        <form className="login-form">
          <label>
            Personnummer eller e-post
            <input type="text" placeholder="Demo: hassan@example.se" />
          </label>

          <label>
            Lösenord
            <input type="password" placeholder="••••••••" />
          </label>

          <button type="button" onClick={onLogin}>
            Logga in i demo
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
