import { useMemo, useState } from "react";
import Login from "./pages/Login";

const collectionCases = [
  {
    id: "KR-24018",
    company: "Svea Inkasso",
    creditor: "Elbolaget Nord",
    originalDebt: 3950,
    fees: 540,
    interest: 370,
    amount: 4860,
    status: "Inkasso",
    dueDate: "2026-06-28",
    risk: "Hög",
    suggestedPlan: 1200,
    interestMonthly: 85,
  },
  {
    id: "KR-24021",
    company: "Alektum Group",
    creditor: "Mobiloperatör",
    originalDebt: 1850,
    fees: 320,
    interest: 170,
    amount: 2340,
    status: "Påminnelse",
    dueDate: "2026-07-04",
    risk: "Medel",
    suggestedPlan: 650,
    interestMonthly: 35,
  },
  {
    id: "KR-24027",
    company: "Intrum",
    creditor: "Delbetalning butik",
    originalDebt: 7950,
    fees: 690,
    interest: 540,
    amount: 9180,
    status: "Avbetalning möjlig",
    dueDate: "2026-07-16",
    risk: "Medel",
    suggestedPlan: 1800,
    interestMonthly: 120,
  },
  {
    id: "KR-24032",
    company: "Lowell",
    creditor: "Bredbandstjänst",
    originalDebt: 980,
    fees: 180,
    interest: 120,
    amount: 1280,
    status: "Förfaller snart",
    dueDate: "2026-06-22",
    risk: "Låg",
    suggestedPlan: 450,
    interestMonthly: 20,
  },
];

const currencyFormatter = new Intl.NumberFormat("sv-SE", {
  maximumFractionDigits: 0,
  style: "currency",
  currency: "SEK",
});

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatDate(value) {
  return dateFormatter.format(new Date(value));
}

function getRiskClass(risk) {
  if (risk === "Hög") {
    return "risk-high";
  }

  if (risk === "Medel") {
    return "risk-medium";
  }

  return "risk-low";
}

function makeForecast(cases, monthlyPayment) {
  const totalDebt = cases.reduce((sum, item) => sum + item.amount, 0);
  const monthlyFees = cases.reduce((sum, item) => sum + item.interestMonthly, 0);
  const effectivePayment = Math.max(0, monthlyPayment - monthlyFees);
  const months = effectivePayment > 0 ? Math.ceil(totalDebt / effectivePayment) : null;
  const afterSixMonths = Math.max(0, totalDebt + monthlyFees * 6 - monthlyPayment * 6);

  return {
    totalDebt,
    monthlyFees,
    effectivePayment,
    months,
    afterSixMonths,
  };
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(2500);
  const [selectedCaseId, setSelectedCaseId] = useState(collectionCases[0].id);

  const selectedCase =
    collectionCases.find((item) => item.id === selectedCaseId) ?? collectionCases[0];

  const forecast = useMemo(
    () => makeForecast(collectionCases, Number(monthlyPayment) || 0),
    [monthlyPayment],
  );

  const highRiskCases = collectionCases.filter((item) => item.risk === "Hög");
  const nextDueCase = [...collectionCases].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
  )[0];
  const totalSuggestedPlan = collectionCases.reduce(
    (sum, item) => sum + item.suggestedPlan,
    0,
  );

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">K</div>
          <div>
            <strong>KronoPay</strong>
            <span>Skuldkoll & inkasso</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Huvudnavigation">
          <a href="#oversikt">Översikt</a>
          <a href="#arenden">Inkassoärenden</a>
          <a href="#skulddetalj">Skulddetalj</a>
          <a href="#prognos">Prognos</a>
        </nav>

        <button className="logout-button" type="button" onClick={() => setLoggedIn(false)}>
          Logga ut
        </button>
      </aside>

      <main className="main-content">
        <section className="hero-card" id="oversikt">
          <div>
            <p className="eyebrow">Demo-inloggning aktiv</p>
            <h1>Din skuldkoll</h1>
            <p>
              Samlad demoöversikt över inkassoärenden, risknivåer och möjliga
              avbetalningsplaner. BankID och riktiga integrationer kopplas senare.
            </p>
          </div>
          <div className="bankid-preview">
            <span>BankID senare</span>
            <strong>Demo</strong>
          </div>
        </section>

        <section className="stats-grid" aria-label="Skuldöversikt">
          <article className="stat-card">
            <span>Total skuld</span>
            <strong>{formatCurrency(forecast.totalDebt)}</strong>
            <small>{collectionCases.length} aktiva ärenden</small>
          </article>
          <article className="stat-card">
            <span>Hög risk</span>
            <strong>{highRiskCases.length}</strong>
            <small>Prioritera ärenden nära förfallodatum</small>
          </article>
          <article className="stat-card">
            <span>Närmast förfall</span>
            <strong>{formatDate(nextDueCase.dueDate)}</strong>
            <small>{nextDueCase.company}</small>
          </article>
          <article className="stat-card">
            <span>Föreslagen månadsplan</span>
            <strong>{formatCurrency(totalSuggestedPlan)}</strong>
            <small>Summerat från demoärenden</small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel cases-panel" id="arenden">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Inkassoärenden</p>
                <h2>Alla skulder på ett ställe</h2>
              </div>
              <span>{collectionCases.length} ärenden</span>
            </div>

            <div className="case-list">
              {collectionCases.map((item) => (
                <button
                  className={item.id === selectedCase.id ? "case-row active" : "case-row"}
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCaseId(item.id)}
                >
                  <span>
                    <strong>{item.company}</strong>
                    <small>{item.creditor}</small>
                  </span>
                  <span>
                    <strong>{formatCurrency(item.amount)}</strong>
                    <small>{item.status}</small>
                  </span>
                  <span>
                    <strong>{formatDate(item.dueDate)}</strong>
                    <small>Förfallodatum</small>
                  </span>
                  <span className={`risk-pill ${getRiskClass(item.risk)}`}>
                    {item.risk}
                  </span>
                  <small className="case-open-hint">Öppna detalj</small>
                </button>
              ))}
            </div>
          </article>

          <article className="panel detail-panel" id="skulddetalj">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Skulddetalj</p>
                <h2>{selectedCase.company}</h2>
              </div>
              <span>{selectedCase.id}</span>
            </div>

            <div className="debt-detail-summary">
              <span>Totalt belopp</span>
              <strong>{formatCurrency(selectedCase.amount)}</strong>
              <small>
                Status: {selectedCase.status} · Förfallodatum{" "}
                {formatDate(selectedCase.dueDate)}
              </small>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Inkassobolag</dt>
                <dd>{selectedCase.company}</dd>
              </div>
              <div>
                <dt>Ursprunglig fordringsägare</dt>
                <dd>{selectedCase.creditor}</dd>
              </div>
              <div>
                <dt>Ärendenummer</dt>
                <dd>{selectedCase.id}</dd>
              </div>
              <div>
                <dt>Ursprunglig skuld</dt>
                <dd>{formatCurrency(selectedCase.originalDebt)}</dd>
              </div>
              <div>
                <dt>Avgifter</dt>
                <dd>{formatCurrency(selectedCase.fees)}</dd>
              </div>
              <div>
                <dt>Ränta</dt>
                <dd>{formatCurrency(selectedCase.interest)}</dd>
              </div>
              <div>
                <dt>Totalt belopp</dt>
                <dd>{formatCurrency(selectedCase.amount)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedCase.status}</dd>
              </div>
              <div>
                <dt>Förfallodatum</dt>
                <dd>{formatDate(selectedCase.dueDate)}</dd>
              </div>
            </dl>

            <div className="plan-note">
              <strong>Avbetalningsförslag</strong>
              <p>
                Kontakta inkassobolaget och föreslå en plan runt{" "}
                {formatCurrency(selectedCase.suggestedPlan)} per månad. Detta är
                bara demo och ingen juridisk rådgivning.
              </p>
            </div>
          </article>

          <article className="panel forecast-panel" id="prognos">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Prognos</p>
                <h2>Vad händer om du betalar X kr/mån?</h2>
              </div>
            </div>

            <label className="payment-slider">
              <span>Månadsbetalning: {formatCurrency(Number(monthlyPayment) || 0)}</span>
              <input
                type="range"
                min="500"
                max="12000"
                step="250"
                value={monthlyPayment}
                onChange={(event) => setMonthlyPayment(Number(event.target.value))}
              />
            </label>

            <div className="forecast-grid">
              <div>
                <span>Avgifter/ränta i demo</span>
                <strong>{formatCurrency(forecast.monthlyFees)} / mån</strong>
              </div>
              <div>
                <span>Effektiv amortering</span>
                <strong>{formatCurrency(forecast.effectivePayment)} / mån</strong>
              </div>
              <div>
                <span>Beräknad skuldfri tid</span>
                <strong>
                  {forecast.months ? `${forecast.months} månader` : "Betalning för låg"}
                </strong>
              </div>
              <div>
                <span>Skuld efter 6 månader</span>
                <strong>{formatCurrency(forecast.afterSixMonths)}</strong>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
