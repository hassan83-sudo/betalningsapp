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

const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
  month: "long",
  year: "numeric",
});

const collectionTimelineSteps = [
  "Idag",
  "Påminnelse",
  "Inkasso",
  "Betalningsföreläggande",
  "Kronofogden",
];

const paymentOptions = [1000, 2000, 3000, 4000];

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatDate(value) {
  return dateFormatter.format(new Date(value));
}

function formatMonth(value) {
  return monthFormatter.format(value);
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

function getTimelineIndex(status) {
  if (status === "Påminnelse" || status === "Förfaller snart") {
    return 1;
  }

  if (status === "Inkasso" || status === "Avbetalning möjlig") {
    return 2;
  }

  return 0;
}

function makeTimelineSummary(item) {
  const currentIndex = getTimelineIndex(item.status);
  const nextStep = collectionTimelineSteps[currentIndex + 1] ?? "Klar";
  const daysToDue = Math.max(
    0,
    Math.ceil((new Date(item.dueDate) - new Date()) / 86400000),
  );
  const timeToNextStep =
    nextStep === "Klar"
      ? "Ingen kommande eskalering i demo"
      : daysToDue > 0
        ? `${daysToDue} dagar till nästa viktiga datum`
        : "Nästa steg kan bli aktuellt nu";
  const recommendedAction =
    item.risk === "Hög"
      ? "Kontakta inkassobolaget idag och föreslå en realistisk månadsbetalning."
      : item.risk === "Medel"
        ? "Gör en betalningsplan innan förfallodatum och prioritera ärendet i budgeten."
        : "Bevaka förfallodatum och betala eller föreslå plan innan ärendet går vidare.";

  return {
    currentIndex,
    currentStep: collectionTimelineSteps[currentIndex],
    nextStep,
    recommendedAction,
    timeToNextStep,
  };
}

function makeActionPlan(item, cases) {
  const rankedCases = [...cases].sort((a, b) => {
    const riskScore = { "Hög": 0, "Medel": 1, "Låg": 2 };
    const riskDifference = riskScore[a.risk] - riskScore[b.risk];

    if (riskDifference !== 0) {
      return riskDifference;
    }

    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  const priority = rankedCases.findIndex((caseItem) => caseItem.id === item.id) + 1;
  const monthlyPayment = Math.max(1, item.suggestedPlan - item.interestMonthly);
  const debtFreeMonths = Math.ceil(item.amount / monthlyPayment);
  const debtFreeDate = new Date();

  debtFreeDate.setMonth(debtFreeDate.getMonth() + debtFreeMonths);

  const recommendation =
    item.risk === "Hög"
      ? "Kontakta inkassobolaget innan förfallodatum och föreslå betalningsplanen direkt."
      : item.risk === "Medel"
        ? "Säkra en avbetalningsplan innan ärendet riskerar att gå vidare."
        : "Betala eller bekräfta plan i god tid så ärendet inte eskalerar.";

  return {
    debtFreeMonth: formatMonth(debtFreeDate),
    priority,
    recommendation,
    suggestedPayment: item.suggestedPlan,
    totalCases: cases.length,
  };
}

function makeForecast(cases, monthlyPayment) {
  const totalDebt = cases.reduce((sum, item) => sum + item.amount, 0);
  const monthlyFees = cases.reduce((sum, item) => sum + item.interestMonthly, 0);
  const effectivePayment = Math.max(0, monthlyPayment - monthlyFees);
  const months = effectivePayment > 0 ? Math.ceil(totalDebt / effectivePayment) : null;
  const afterThreeMonths = Math.max(0, totalDebt + monthlyFees * 3 - monthlyPayment * 3);
  const afterSixMonths = Math.max(0, totalDebt + monthlyFees * 6 - monthlyPayment * 6);
  const debtFreeDate = months ? new Date() : null;
  const monthlyRows = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date();
    const startDebt = Math.max(
      0,
      totalDebt + monthlyFees * index - monthlyPayment * index,
    );
    const remainingDebt = Math.max(0, startDebt + monthlyFees - monthlyPayment);

    monthDate.setMonth(monthDate.getMonth() + index + 1);

    return {
      id: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      month: formatMonth(monthDate),
      payment: Math.min(monthlyPayment, startDebt + monthlyFees),
      remainingDebt,
      startDebt,
    };
  });

  if (debtFreeDate) {
    debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
  }

  const recommendation =
    !months
      ? "Betalningen täcker inte demoavgifterna. Höj månadsbeloppet innan en plan föreslås."
      : months <= 6
        ? "Stark plan. Du minskar skulden snabbt om beloppet är hållbart i vardagen."
        : months <= 12
          ? "Rimlig plan. Prioritera hög risk först och bekräfta avbetalning skriftligt."
          : "Överväg att höja månadsbetalningen eller förhandla bort avgifter för kortare skuldtid.";

  return {
    afterThreeMonths,
    totalDebt,
    monthlyFees,
    effectivePayment,
    months,
    debtFreeMonth: debtFreeDate ? formatMonth(debtFreeDate) : "Ingen prognos",
    afterSixMonths,
    monthlyRows,
    recommendation,
  };
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(2500);
  const [selectedCaseId, setSelectedCaseId] = useState(collectionCases[0].id);
  const [showDebtDetail, setShowDebtDetail] = useState(false);

  const selectedCase =
    collectionCases.find((item) => item.id === selectedCaseId) ?? collectionCases[0];
  const selectedTimeline = makeTimelineSummary(selectedCase);
  const selectedActionPlan = makeActionPlan(selectedCase, collectionCases);

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

        {showDebtDetail ? (
          <section className="debt-detail-view" id="skulddetalj">
            <article className="panel debt-detail-panel">
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
                  Status: {selectedCase.status} · Risknivå {selectedCase.risk} ·{" "}
                  Förfallodatum {formatDate(selectedCase.dueDate)}
                </small>
              </div>

              <dl className="detail-list debt-detail-list">
                <div>
                  <dt>Inkassobolag</dt>
                  <dd>{selectedCase.company}</dd>
                </div>
                <div>
                  <dt>Ärendenummer</dt>
                  <dd>{selectedCase.id}</dd>
                </div>
                <div>
                  <dt>Ursprunglig fordringsägare</dt>
                  <dd>{selectedCase.creditor}</dd>
                </div>
                <div>
                  <dt>Huvudskuld</dt>
                  <dd>{formatCurrency(selectedCase.originalDebt)}</dd>
                </div>
                <div>
                  <dt>Inkassoavgift</dt>
                  <dd>{formatCurrency(selectedCase.fees)}</dd>
                </div>
                <div>
                  <dt>Ränta/avgifter</dt>
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
                  <dt>Risknivå</dt>
                  <dd>
                    <span className={`risk-pill ${getRiskClass(selectedCase.risk)}`}>
                      {selectedCase.risk}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Förfallodatum</dt>
                  <dd>{formatDate(selectedCase.dueDate)}</dd>
                </div>
                <div>
                  <dt>Föreslagen månadsbetalning</dt>
                  <dd>{formatCurrency(selectedCase.suggestedPlan)} / mån</dd>
                </div>
              </dl>

              <section className="debt-timeline-card" aria-label="Tidslinje för ärendet">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Tidslinje</p>
                    <h2>Ärendets möjliga väg framåt</h2>
                  </div>
                  <span className={`risk-pill ${getRiskClass(selectedCase.risk)}`}>
                    {selectedCase.risk}
                  </span>
                </div>

                <div className="timeline-summary-grid">
                  <div>
                    <span>Nuvarande steg</span>
                    <strong>{selectedTimeline.currentStep}</strong>
                  </div>
                  <div>
                    <span>Kommande steg</span>
                    <strong>{selectedTimeline.nextStep}</strong>
                  </div>
                  <div>
                    <span>Tid till nästa steg</span>
                    <strong>{selectedTimeline.timeToNextStep}</strong>
                  </div>
                </div>

                <ol className="debt-timeline">
                  {collectionTimelineSteps.map((step, index) => (
                    <li
                      className={
                        index === selectedTimeline.currentIndex
                          ? "timeline-step current"
                          : "timeline-step"
                      }
                      key={step}
                    >
                      <span>{index + 1}</span>
                      <strong>{step}</strong>
                    </li>
                  ))}
                </ol>

                <div className="recommended-action">
                  <span>Rekommenderad åtgärd</span>
                  <strong>{selectedTimeline.recommendedAction}</strong>
                </div>
              </section>

              <section className="ai-action-plan" aria-label="AI Handlingsplan">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">AI Handlingsplan</p>
                    <h2>Nästa bästa steg</h2>
                  </div>
                  <span className={`risk-pill ${getRiskClass(selectedCase.risk)}`}>
                    {selectedCase.risk}
                  </span>
                </div>

                <div className="action-plan-grid">
                  <div>
                    <span>Risknivå</span>
                    <strong>{selectedCase.risk}</strong>
                  </div>
                  <div>
                    <span>Prioritet</span>
                    <strong>
                      {selectedActionPlan.priority} av {selectedActionPlan.totalCases} ärenden
                    </strong>
                  </div>
                  <div className="action-plan-wide">
                    <span>Rekommenderad åtgärd</span>
                    <strong>{selectedActionPlan.recommendation}</strong>
                  </div>
                  <div>
                    <span>Förslag på avbetalning</span>
                    <strong>
                      {formatCurrency(selectedActionPlan.suggestedPayment)} / mån
                    </strong>
                  </div>
                  <div>
                    <span>Beräknad skuldfri månad</span>
                    <strong>{selectedActionPlan.debtFreeMonth}</strong>
                  </div>
                </div>
              </section>

              <div className="plan-note">
                <strong>Avbetalningsförslag</strong>
                <p>
                  Kontakta inkassobolaget och föreslå en plan runt{" "}
                  {formatCurrency(selectedCase.suggestedPlan)} per månad. Detta är
                  bara demo och ingen juridisk rådgivning.
                </p>
              </div>

              <button
                className="back-button"
                type="button"
                onClick={() => setShowDebtDetail(false)}
              >
                Tillbaka till översikt
              </button>
            </article>
          </section>
        ) : (
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
                    onClick={() => {
                      setSelectedCaseId(item.id);
                      setShowDebtDetail(true);
                    }}
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

            <article className="panel forecast-panel" id="prognos">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Min betalningsplan</p>
                  <h2>Välj månadsbetalning</h2>
                </div>
              </div>

              <div className="payment-plan-controls">
                <div className="payment-option-grid">
                  {paymentOptions.map((option) => (
                    <button
                      className={
                        Number(monthlyPayment) === option
                          ? "payment-option active"
                          : "payment-option"
                      }
                      key={option}
                      type="button"
                      onClick={() => setMonthlyPayment(option)}
                    >
                      {formatCurrency(option)} / mån
                    </button>
                  ))}
                </div>

                <label className="payment-slider">
                  <span>
                    Total månadsbetalning: {formatCurrency(Number(monthlyPayment) || 0)}
                  </span>
                  <input
                    type="range"
                    min="500"
                    max="12000"
                    step="250"
                    value={monthlyPayment}
                    onChange={(event) => setMonthlyPayment(Number(event.target.value))}
                  />
                </label>
              </div>

              <div className="forecast-grid">
                <div>
                  <span>Beräknad tid tills skuldfri</span>
                  <strong>
                    {forecast.months ? `${forecast.months} månader` : "Betalning för låg"}
                  </strong>
                </div>
                <div>
                  <span>Skuld efter 3 månader</span>
                  <strong>{formatCurrency(forecast.afterThreeMonths)}</strong>
                </div>
                <div>
                  <span>Skuld efter 6 månader</span>
                  <strong>{formatCurrency(forecast.afterSixMonths)}</strong>
                </div>
                <div>
                  <span>Total månadsbetalning</span>
                  <strong>{formatCurrency(Number(monthlyPayment) || 0)}</strong>
                </div>
              </div>

              <div className="payment-recommendation">
                <span>Kort rekommendation</span>
                <strong>{forecast.recommendation}</strong>
              </div>

              <div className="monthly-overview">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Skuldöversikt per månad</p>
                    <h2>Prognostabell</h2>
                  </div>
                  <span>Skuldfri: {forecast.debtFreeMonth}</span>
                </div>

                <div className="monthly-table">
                  <div className="monthly-table-head">
                    <span>Månad</span>
                    <span>Startskuld</span>
                    <span>Betalning</span>
                    <span>Kvarvarande skuld</span>
                  </div>

                  {forecast.monthlyRows.map((row) => (
                    <div className="monthly-table-row" key={row.id}>
                      <strong>{row.month}</strong>
                      <span>{formatCurrency(row.startDebt)}</span>
                      <span>-{formatCurrency(row.payment)}</span>
                      <span>{formatCurrency(row.remainingDebt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
