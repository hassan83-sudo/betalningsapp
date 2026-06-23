import { useEffect, useMemo, useState } from "react";
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

const actionCenterStorageKey = "kronopay.actionCenter";
const eventHistoryStorageKey = "kronopay.eventHistory";
const documentStatusStorageKey = "kronopay.documentStatus";
const communicationStorageKey = "kronopay.communicationMessages";
const notificationStatusStorageKey = "kronopay.notificationStatus";

const debtDocuments = [
  {
    id: "document-inkasso-kr-24018",
    caseId: "KR-24018",
    date: "2026-06-18",
    status: "Oläst",
    type: "Inkassobrev",
  },
  {
    id: "document-plan-kr-24027",
    caseId: "KR-24027",
    date: "2026-06-17",
    status: "Oläst",
    type: "Betalningsplan",
  },
  {
    id: "document-confirmation-kr-24032",
    caseId: "KR-24032",
    date: "2026-06-16",
    status: "Oläst",
    type: "Bekräftelse",
  },
  {
    id: "document-message-kr-24021",
    caseId: "KR-24021",
    date: "2026-06-15",
    status: "Oläst",
    type: "Meddelande",
  },
];

const debtActions = [
  "Ring inkassobolaget",
  "Begär avbetalningsplan",
  "Begär paus/anstånd",
  "Kontrollera skuldens uppgifter",
  "Markera som åtgärdad",
];

const historyFilters = ["Alla", "Betalningar", "Inkasso", "AI", "Åtgärder"];

const communicationQuickReplies = [
  {
    body: "Jag vill diskutera en betalningsplan som passar min ekonomi.",
    subject: "Begär avbetalningsplan",
  },
  {
    body: "Jag vill begära anstånd och få mer tid innan nästa steg.",
    subject: "Begär anstånd",
  },
  {
    body: "Jag vill kontrollera uppgifterna i ärendet och få mer information om skulden.",
    subject: "Fråga om skuld",
  },
  {
    body: "Jag vill bekräfta att betalning är gjord eller planerad.",
    subject: "Bekräfta betalning",
  },
];

function getDefaultCommunicationDraft() {
  return {
    body: "Jag vill diskutera en betalningsplan.",
    caseId: collectionCases[0].id,
    company: collectionCases[0].company,
    subject: "Begär avbetalningsplan",
  };
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatDate(value) {
  return dateFormatter.format(new Date(value));
}

function formatMonth(value) {
  return monthFormatter.format(value);
}

function getStoredActionCenter() {
  try {
    const storedValue = window.localStorage.getItem(actionCenterStorageKey);

    return storedValue ? JSON.parse(storedValue) : {};
  } catch {
    return {};
  }
}

function makeHistoryDate(daysAgo, hours, minutes) {
  const date = new Date();

  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
}

function makeReminderDate(daysFromNow, hours = 9, minutes = 0) {
  const date = new Date();

  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);

  return date.toISOString();
}

function getDefaultHistoryEvents() {
  return [
    {
      id: "history-ai-plan",
      createdAt: makeHistoryDate(0, 9, 20),
      description: "AI Handlingsplan skapades för högst prioriterade ärenden.",
      statusIcon: "AI",
      type: "AI",
    },
    {
      id: "history-plan-updated",
      createdAt: makeHistoryDate(1, 16, 10),
      description: "Avbetalningsplan uppdaterades i Min betalningsplan.",
      statusIcon: "✓",
      type: "Åtgärder",
    },
    {
      id: "history-new-case",
      createdAt: makeHistoryDate(7, 11, 35),
      description: "Nytt inkassoärende registrerades från Svea Inkasso.",
      statusIcon: "!",
      type: "Inkasso",
    },
    {
      id: "history-payment",
      createdAt: makeHistoryDate(8, 14, 5),
      description: "Betalning registrerad på ett aktivt ärende.",
      statusIcon: "kr",
      type: "Betalningar",
    },
  ];
}

function getStoredHistoryEvents() {
  try {
    const storedValue = window.localStorage.getItem(eventHistoryStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;

    return Array.isArray(parsedValue) && parsedValue.length > 0
      ? parsedValue
      : getDefaultHistoryEvents();
  } catch {
    return getDefaultHistoryEvents();
  }
}

function getStoredDocumentStatus() {
  try {
    const storedValue = window.localStorage.getItem(documentStatusStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;

    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function getDefaultCommunicationMessages() {
  return [
    {
      body: "Jag vill diskutera en betalningsplan.",
      caseId: "KR-24018",
      company: "Svea Inkasso",
      createdAt: makeHistoryDate(0, 10, 45),
      id: "message-demo-payment-plan",
      status: "Skickat",
      subject: "Begär avbetalningsplan",
    },
  ];
}

function getStoredCommunicationMessages() {
  try {
    const storedValue = window.localStorage.getItem(communicationStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;

    return Array.isArray(parsedValue) ? parsedValue : getDefaultCommunicationMessages();
  } catch {
    return getDefaultCommunicationMessages();
  }
}

function getDemoNotifications() {
  return [
    {
      caseId: "KR-24032",
      date: makeReminderDate(5, 9, 0),
      id: "notification-lowell-due",
      priority: "Hög",
      title: "Lowell förfaller om 5 dagar",
      type: "Kommande förfallodatum",
    },
    {
      caseId: "KR-24018",
      date: makeReminderDate(7, 10, 30),
      id: "notification-payment-plan",
      priority: "Medel",
      title: "Avbetalning ska betalas nästa vecka",
      type: "Betalningsplan",
    },
    {
      caseId: "KR-24018",
      date: makeReminderDate(2, 14, 0),
      id: "notification-follow-up",
      priority: "Medel",
      title: "Följ upp svar från inkassobolag",
      type: "Viktig åtgärd",
    },
    {
      caseId: "KR-24027",
      date: makeReminderDate(10, 8, 45),
      id: "notification-intrum-review",
      priority: "Låg",
      title: "Kontrollera uppgifter i ärendet",
      type: "Inkassoärende",
    },
  ];
}

function getStoredNotificationStatus() {
  try {
    const storedValue = window.localStorage.getItem(notificationStatusStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;

    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function getActionStatus(caseActions = {}) {
  const completedCount = debtActions.filter((action) => caseActions[action]?.done).length;

  if (completedCount === debtActions.length) {
    return "Åtgärdad";
  }

  if (completedCount > 0) {
    return "Påbörjad";
  }

  return "Ej påbörjad";
}

function getLastUpdated(caseActions = {}) {
  const latestDate = debtActions
    .map((action) => caseActions[action]?.updatedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  return latestDate ? formatDate(latestDate) : "Inte uppdaterad";
}

function formatHistoryDate(value) {
  const eventDate = new Date(value);
  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate.getTime() === today.getTime()) {
    return "Idag";
  }

  if (eventDate.getTime() === yesterday.getTime()) {
    return "Igår";
  }

  return formatDate(value);
}

function formatHistoryTime(value) {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

function getPrioritizedCases(cases) {
  const riskScore = { "Hög": 0, "Medel": 1, "Låg": 2 };

  return [...cases].sort((a, b) => {
    const riskDifference = riskScore[a.risk] - riskScore[b.risk];

    if (riskDifference !== 0) {
      return riskDifference;
    }

    const dueDateDifference = new Date(a.dueDate) - new Date(b.dueDate);

    if (dueDateDifference !== 0) {
      return dueDateDifference;
    }

    return b.amount - a.amount;
  });
}

function makePriorityReason(item) {
  if (item.risk === "Hög") {
    return "Hög risk och aktivt inkassoläge gör att ärendet bör hanteras först.";
  }

  if (item.status === "Förfaller snart") {
    return "Förfallodatumet ligger nära och ärendet kan snabbt bli dyrare.";
  }

  if (item.amount >= 5000) {
    return "Beloppet är högt och påverkar total skuldbild mest.";
  }

  return "Lägre risk, men bör säkras med betalning eller plan innan nästa steg.";
}

function makePriorityConsequence(item) {
  if (item.risk === "Hög") {
    return "Ärendet kan gå vidare mot betalningsföreläggande om ingen kontakt tas.";
  }

  if (item.risk === "Medel") {
    return "Avgifter kan fortsätta öka och ärendet kan bli svårare att förhandla.";
  }

  return "Skulden kan eskalera från låg risk till inkasso om förfallodatum missas.";
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

function makeFutureScenarios(cases) {
  const totalDebt = cases.reduce((sum, item) => sum + item.amount, 0);
  const recommendedPayment = cases.reduce((sum, item) => sum + item.suggestedPlan, 0);
  const aggressivePayment = Math.round(recommendedPayment * 1.5);
  const monthlyFees = cases.reduce((sum, item) => sum + item.interestMonthly, 0);

  return [
    {
      aiComment: "Skulden riskerar att gå vidare till nästa steg.",
      costMultiplier: 1.22,
      development: "Skulden kan växa och flera ärenden kan eskalera.",
      monthlyPayment: 0,
      name: "Betalar inget",
      risk: "Hög",
    },
    {
      aiComment: "Rimlig balans mellan ekonomi och återbetalning.",
      costMultiplier: 1.08,
      development: "Skulden minskar stegvis om planen hålls varje månad.",
      monthlyPayment: recommendedPayment,
      name: "Betalar rekommenderat",
      risk: "Medel",
    },
    {
      aiComment: "Snabbaste vägen till skuldfrihet.",
      costMultiplier: 1.03,
      development: "Skulden minskar snabbt och risken sjunker tydligt.",
      monthlyPayment: aggressivePayment,
      name: "Betalar aggressivt",
      risk: "Låg",
    },
  ].map((scenario) => {
    const effectivePayment = Math.max(0, scenario.monthlyPayment - monthlyFees);
    const months =
      effectivePayment > 0 ? Math.ceil(totalDebt / effectivePayment) : null;
    const debtFreeDate = months ? new Date() : null;

    if (debtFreeDate) {
      debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
    }

    return {
      ...scenario,
      debtFreeMonth: debtFreeDate ? formatMonth(debtFreeDate) : "Ej beräknad",
      totalCost: Math.round(totalDebt * scenario.costMultiplier),
    };
  });
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(2500);
  const [selectedCaseId, setSelectedCaseId] = useState(collectionCases[0].id);
  const [showDebtDetail, setShowDebtDetail] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [actionCenter, setActionCenter] = useState(getStoredActionCenter);
  const [historyEvents, setHistoryEvents] = useState(getStoredHistoryEvents);
  const [historyFilter, setHistoryFilter] = useState("Alla");
  const [documentStatus, setDocumentStatus] = useState(getStoredDocumentStatus);
  const [communicationMessages, setCommunicationMessages] = useState(
    getStoredCommunicationMessages,
  );
  const [communicationDraft, setCommunicationDraft] = useState(
    getDefaultCommunicationDraft,
  );
  const [notificationStatus, setNotificationStatus] = useState(
    getStoredNotificationStatus,
  );

  const selectedCase =
    collectionCases.find((item) => item.id === selectedCaseId) ?? collectionCases[0];
  const selectedTimeline = makeTimelineSummary(selectedCase);
  const selectedActionPlan = makeActionPlan(selectedCase, collectionCases);

  const forecast = useMemo(
    () => makeForecast(collectionCases, Number(monthlyPayment) || 0),
    [monthlyPayment],
  );
  const futureScenarios = useMemo(() => makeFutureScenarios(collectionCases), []);
  const prioritizedCases = useMemo(() => getPrioritizedCases(collectionCases), []);
  const filteredHistoryEvents =
    historyFilter === "Alla"
      ? historyEvents
      : historyEvents.filter((event) => event.type === historyFilter);
  const completedActionCount = collectionCases.reduce(
    (sum, item) =>
      sum + debtActions.filter((action) => actionCenter[item.id]?.[action]?.done).length,
    0,
  );
  const totalActionCount = collectionCases.length * debtActions.length;
  const readDocumentCount = debtDocuments.filter(
    (document) => documentStatus[document.id]?.read,
  ).length;
  const sentMessageCount = communicationMessages.filter(
    (message) => message.status === "Skickat",
  ).length;
  const notifications = useMemo(() => getDemoNotifications(), []);
  const openNotificationCount = notifications.filter(
    (notification) => !notificationStatus[notification.id]?.done,
  ).length;

  const highRiskCases = collectionCases.filter((item) => item.risk === "Hög");
  const nextDueCase = [...collectionCases].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
  )[0];
  const totalSuggestedPlan = collectionCases.reduce(
    (sum, item) => sum + item.suggestedPlan,
    0,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(actionCenterStorageKey, JSON.stringify(actionCenter));
    } catch {
      // Demo state should not break the app if localStorage is unavailable.
    }
  }, [actionCenter]);

  useEffect(() => {
    try {
      window.localStorage.setItem(eventHistoryStorageKey, JSON.stringify(historyEvents));
    } catch {
      // Demo history should not break the app if localStorage is unavailable.
    }
  }, [historyEvents]);

  useEffect(() => {
    try {
      window.localStorage.setItem(documentStatusStorageKey, JSON.stringify(documentStatus));
    } catch {
      // Demo document status should not break the app if localStorage is unavailable.
    }
  }, [documentStatus]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        communicationStorageKey,
        JSON.stringify(communicationMessages),
      );
    } catch {
      // Demo communication should not break the app if localStorage is unavailable.
    }
  }, [communicationMessages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        notificationStatusStorageKey,
        JSON.stringify(notificationStatus),
      );
    } catch {
      // Demo notification status should not break the app if localStorage is unavailable.
    }
  }, [notificationStatus]);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  function toggleDebtAction(caseId, action) {
    const matchingCase = collectionCases.find((item) => item.id === caseId);
    const nextDone = !actionCenter[caseId]?.[action]?.done;

    setActionCenter((current) => {
      return {
        ...current,
        [caseId]: {
          ...current[caseId],
          [action]: {
            done: nextDone,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });

    setHistoryEvents((current) => [
      {
        id: `history-${caseId}-${action}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        description: `${action} ${
          nextDone ? "markerades som klar" : "markerades som ej klar"
        }${matchingCase ? ` för ${matchingCase.company}` : ""}.`,
        statusIcon: "✓",
        type: "Åtgärder",
      },
      ...current,
    ]);
  }

  function markDocumentAsRead(documentId) {
    setDocumentStatus((current) => ({
      ...current,
      [documentId]: {
        read: true,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function updateCommunicationDraft(field, value) {
    if (field === "caseId") {
      const matchingCase =
        collectionCases.find((item) => item.id === value) ?? collectionCases[0];

      setCommunicationDraft((current) => ({
        ...current,
        caseId: matchingCase.id,
        company: matchingCase.company,
      }));
      return;
    }

    setCommunicationDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyCommunicationQuickReply(reply) {
    setCommunicationDraft((current) => ({
      ...current,
      body: reply.body,
      subject: reply.subject,
    }));
  }

  function sendCommunicationMessage(event) {
    event.preventDefault();

    const subject = communicationDraft.subject.trim();
    const body = communicationDraft.body.trim();

    if (!subject || !body) {
      return;
    }

    setCommunicationMessages((current) => [
      {
        body,
        caseId: communicationDraft.caseId,
        company: communicationDraft.company,
        createdAt: new Date().toISOString(),
        id: `message-${Date.now()}`,
        status: "Skickat",
        subject,
      },
      ...current,
    ]);

    setCommunicationDraft((current) => ({
      ...current,
      body: "",
      subject: "",
    }));
  }

  function updateNotificationStatus(notificationId, field) {
    setNotificationStatus((current) => ({
      ...current,
      [notificationId]: {
        ...current[notificationId],
        [field]: true,
        updatedAt: new Date().toISOString(),
      },
    }));
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

            <article className="panel priority-panel" id="prioritering">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Prioriteringscenter</p>
                  <h2>Vilka skulder ska hanteras först?</h2>
                </div>
                <span>Risk · datum · belopp</span>
              </div>

              <div className="priority-list">
                {prioritizedCases.map((item, index) => (
                  <article className="priority-card" key={item.id}>
                    <div className="priority-card-top">
                      <span className="priority-number">Prioritet {index + 1}</span>
                      <span className={`risk-pill ${getRiskClass(item.risk)}`}>
                        {item.risk}
                      </span>
                    </div>

                    <div className="priority-main">
                      <div>
                        <span>Inkassobolag</span>
                        <strong>{item.company}</strong>
                      </div>
                      <div>
                        <span>Belopp</span>
                        <strong>{formatCurrency(item.amount)}</strong>
                      </div>
                      <div>
                        <span>Förfallodatum</span>
                        <strong>{formatDate(item.dueDate)}</strong>
                      </div>
                    </div>

                    <div className="priority-copy">
                      <div>
                        <span>Varför prioriteras den?</span>
                        <p>{makePriorityReason(item)}</p>
                      </div>
                      <div>
                        <span>Rekommenderad åtgärd</span>
                        <p>{makeActionPlan(item, collectionCases).recommendation}</p>
                      </div>
                      <div>
                        <span>Potentiell konsekvens</span>
                        <p>{makePriorityConsequence(item)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel future-panel" id="framtidsprognos">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Framtidsprognos</p>
                  <h2>Tre möjliga vägar framåt</h2>
                </div>
                <span>Demo</span>
              </div>

              <div className="future-scenario-grid">
                {futureScenarios.map((scenario) => (
                  <article className="future-scenario-card" key={scenario.name}>
                    <div className="future-scenario-top">
                      <strong>{scenario.name}</strong>
                      <span className={`risk-pill ${getRiskClass(scenario.risk)}`}>
                        {scenario.risk}
                      </span>
                    </div>

                    <dl>
                      <div>
                        <dt>Beräknad skuldfri månad</dt>
                        <dd>{scenario.debtFreeMonth}</dd>
                      </div>
                      <div>
                        <dt>Total kostnad</dt>
                        <dd>{formatCurrency(scenario.totalCost)}</dd>
                      </div>
                      <div>
                        <dt>Förväntad utveckling</dt>
                        <dd>{scenario.development}</dd>
                      </div>
                    </dl>

                    <div className="future-ai-comment">
                      <span>Kort AI-kommentar</span>
                      <p>{scenario.aiComment}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel action-center-panel" id="atgardscenter">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Åtgärdscenter</p>
                  <h2>Praktiska nästa steg</h2>
                </div>
                <span>
                  Åtgärder klara: {completedActionCount} av {totalActionCount}
                </span>
              </div>

              <div className="action-progress">
                <div>
                  <span>Framsteg</span>
                  <strong>
                    {completedActionCount} / {totalActionCount}
                  </strong>
                </div>
                <div className="action-progress-bar">
                  <span
                    style={{
                      width: `${Math.round((completedActionCount / totalActionCount) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="action-case-list">
                {prioritizedCases.map((item, index) => {
                  const caseActions = actionCenter[item.id] ?? {};
                  const completedForCase = debtActions.filter(
                    (action) => caseActions[action]?.done,
                  ).length;
                  const actionStatus = getActionStatus(caseActions);

                  return (
                    <article
                      className={
                        actionStatus === "Åtgärdad"
                          ? "action-case-card completed"
                          : "action-case-card"
                      }
                      key={item.id}
                    >
                      <div className="action-case-header">
                        <div>
                          <span className="priority-number">Prioritet {index + 1}</span>
                          <h3>{item.company}</h3>
                          <p>{formatCurrency(item.amount)} · {item.creditor}</p>
                        </div>
                        <span className={`action-status ${actionStatus === "Åtgärdad" ? "done" : ""}`}>
                          {actionStatus}
                        </span>
                      </div>

                      <div className="action-meta-grid">
                        <div>
                          <span>Senast uppdaterad</span>
                          <strong>{getLastUpdated(caseActions)}</strong>
                        </div>
                        <div>
                          <span>Prioritetsnivå</span>
                          <strong>{index + 1} av {collectionCases.length}</strong>
                        </div>
                        <div>
                          <span>Åtgärdsstatus</span>
                          <strong>{completedForCase} av {debtActions.length} klara</strong>
                        </div>
                      </div>

                      <div className="action-checklist">
                        {debtActions.map((action) => {
                          const isDone = Boolean(caseActions[action]?.done);

                          return (
                            <button
                              className={isDone ? "action-check done" : "action-check"}
                              key={action}
                              type="button"
                              onClick={() => toggleDebtAction(item.id, action)}
                            >
                              <span>{isDone ? "✓" : ""}</span>
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>

            <article className="panel history-panel" id="historik">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Historik & Händelser</p>
                  <h2>All aktivitet i KronoPay</h2>
                </div>
                <span>{filteredHistoryEvents.length} händelser</span>
              </div>

              <div className="history-filters" aria-label="Filtrera historik">
                {historyFilters.map((filter) => (
                  <button
                    className={
                      historyFilter === filter
                        ? "history-filter active"
                        : "history-filter"
                    }
                    key={filter}
                    type="button"
                    onClick={() => setHistoryFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="history-timeline">
                {filteredHistoryEvents.map((event) => (
                  <article className="history-event" key={event.id}>
                    <div className="history-icon">{event.statusIcon}</div>
                    <div className="history-date">
                      <strong>{formatHistoryDate(event.createdAt)}</strong>
                      <span>{formatHistoryTime(event.createdAt)}</span>
                    </div>
                    <div className="history-copy">
                      <span>{event.type}</span>
                      <p>{event.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel documents-panel" id="dokument">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Dokument & Avtal</p>
                  <h2>Samlad dokumentyta</h2>
                </div>
                <span>
                  Lästa dokument: {readDocumentCount} av {debtDocuments.length}
                </span>
              </div>

              <div className="documents-summary">
                <strong>Inkassobrev, betalningsplaner, bekräftelser och meddelanden</strong>
                <p>
                  Demoarkiv för dokument kopplade till dina inkassoärenden. Lässtatus
                  sparas lokalt i webbläsaren.
                </p>
              </div>

              <div className="document-list">
                {debtDocuments.map((document) => {
                  const linkedCase = collectionCases.find(
                    (item) => item.id === document.caseId,
                  );
                  const isRead = Boolean(documentStatus[document.id]?.read);
                  const readableStatus = isRead ? "Läst" : document.status;

                  return (
                    <article
                      className={isRead ? "document-card read" : "document-card"}
                      key={document.id}
                    >
                      <div className="document-card-top">
                        <span className="document-type">{document.type}</span>
                        <span
                          className={
                            isRead ? "document-status read" : "document-status"
                          }
                        >
                          {readableStatus}
                        </span>
                      </div>

                      <dl className="document-meta">
                        <div>
                          <dt>Dokumenttyp</dt>
                          <dd>{document.type}</dd>
                        </div>
                        <div>
                          <dt>Datum</dt>
                          <dd>{formatDate(document.date)}</dd>
                        </div>
                        <div>
                          <dt>Kopplat inkassoärende</dt>
                          <dd>
                            {linkedCase
                              ? `${linkedCase.company} · ${linkedCase.id}`
                              : document.caseId}
                          </dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{readableStatus}</dd>
                        </div>
                      </dl>

                      <div className="document-actions">
                        <button type="button">Öppna dokument (demo)</button>
                        <button
                          className={isRead ? "mark-read read" : "mark-read"}
                          disabled={isRead}
                          type="button"
                          onClick={() => markDocumentAsRead(document.id)}
                        >
                          {isRead ? "Läst" : "Markera som läst"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>

            <article className="panel communication-panel" id="kommunikation">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Kommunikation</p>
                  <h2>Kontakta inkassobolag</h2>
                </div>
                <span>Antal skickade meddelanden: {sentMessageCount}</span>
              </div>

              <div className="communication-layout">
                <form className="communication-form" onSubmit={sendCommunicationMessage}>
                  <div className="quick-reply-grid" aria-label="Färdiga snabbval">
                    {communicationQuickReplies.map((reply) => (
                      <button
                        key={reply.subject}
                        type="button"
                        onClick={() => applyCommunicationQuickReply(reply)}
                      >
                        {reply.subject}
                      </button>
                    ))}
                  </div>

                  <label>
                    <span>Till</span>
                    <select
                      value={communicationDraft.caseId}
                      onChange={(event) =>
                        updateCommunicationDraft("caseId", event.target.value)
                      }
                    >
                      {collectionCases.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.company}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Ärende</span>
                    <select
                      value={communicationDraft.caseId}
                      onChange={(event) =>
                        updateCommunicationDraft("caseId", event.target.value)
                      }
                    >
                      {collectionCases.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id} · {item.creditor}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Ämne</span>
                    <input
                      value={communicationDraft.subject}
                      placeholder="Begär avbetalningsplan"
                      onChange={(event) =>
                        updateCommunicationDraft("subject", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    <span>Meddelande</span>
                    <textarea
                      rows="4"
                      value={communicationDraft.body}
                      placeholder="Jag vill diskutera en betalningsplan."
                      onChange={(event) =>
                        updateCommunicationDraft("body", event.target.value)
                      }
                    />
                  </label>

                  <button className="communication-submit" type="submit">
                    Skicka demo-meddelande
                  </button>
                </form>

                <div className="message-list">
                  {communicationMessages.map((message) => (
                    <article className="message-card" key={message.id}>
                      <div className="message-card-top">
                        <strong>{message.subject}</strong>
                        <span>{message.status}</span>
                      </div>
                      <p>{message.body}</p>
                      <dl className="message-meta">
                        <div>
                          <dt>Datum</dt>
                          <dd>{formatDate(message.createdAt)}</dd>
                        </div>
                        <div>
                          <dt>Inkassobolag</dt>
                          <dd>{message.company}</dd>
                        </div>
                        <div>
                          <dt>Ärende</dt>
                          <dd>{message.caseId}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{message.status}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel notifications-panel" id="notiser">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Påminnelser & Notiser</p>
                  <h2>Viktiga datum att hålla koll på</h2>
                </div>
                <span>{openNotificationCount} öppna notiser kvar</span>
              </div>

              <div className="notification-list">
                {notifications.map((notification) => {
                  const linkedCase = collectionCases.find(
                    (item) => item.id === notification.caseId,
                  );
                  const status = notificationStatus[notification.id] ?? {};
                  const isRead = Boolean(status.read);
                  const isDone = Boolean(status.done);

                  return (
                    <article
                      className={isDone ? "notification-card done" : "notification-card"}
                      key={notification.id}
                    >
                      <div className="notification-card-top">
                        <div>
                          <strong>{notification.title}</strong>
                          <span>{notification.type}</span>
                        </div>
                        <span
                          className={`notification-priority ${notification.priority.toLowerCase()}`}
                        >
                          {notification.priority}
                        </span>
                      </div>

                      <dl className="notification-meta">
                        <div>
                          <dt>Datum</dt>
                          <dd>{formatDate(notification.date)}</dd>
                        </div>
                        <div>
                          <dt>Inkassoärende</dt>
                          <dd>
                            {linkedCase
                              ? `${linkedCase.company} · ${linkedCase.id}`
                              : notification.caseId}
                          </dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{isDone ? "Klar" : isRead ? "Läst" : "Oläst"}</dd>
                        </div>
                        <div>
                          <dt>Prioritet</dt>
                          <dd>{notification.priority}</dd>
                        </div>
                      </dl>

                      <div className="notification-actions">
                        <button
                          className={isRead ? "notification-action done" : "notification-action"}
                          disabled={isRead}
                          type="button"
                          onClick={() => updateNotificationStatus(notification.id, "read")}
                        >
                          {isRead ? "Läst" : "Markera som läst"}
                        </button>
                        <button
                          className={isDone ? "notification-action done" : "notification-action primary"}
                          disabled={isDone}
                          type="button"
                          onClick={() => updateNotificationStatus(notification.id, "done")}
                        >
                          {isDone ? "Klar" : "Markera som klar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
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

                <div className={showAllMonths ? "monthly-table show-all" : "monthly-table"}>
                  <div className="monthly-table-head">
                    <span>Månad</span>
                    <span>Startskuld</span>
                    <span>Betalning</span>
                    <span>Kvarvarande skuld</span>
                  </div>

                  {forecast.monthlyRows.map((row, index) => (
                    <div
                      className={
                        index >= 4
                          ? "monthly-table-row extra-month"
                          : "monthly-table-row"
                      }
                      key={row.id}
                    >
                      <strong>{row.month}</strong>
                      <span data-label="Startskuld">
                        {formatCurrency(row.startDebt)}
                      </span>
                      <span data-label="Betalning">
                        -{formatCurrency(row.payment)}
                      </span>
                      <span data-label="Kvarvarande skuld">
                        {formatCurrency(row.remainingDebt)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className="monthly-toggle"
                  type="button"
                  onClick={() => setShowAllMonths((current) => !current)}
                >
                  {showAllMonths ? "Visa färre månader" : "Visa fler månader"}
                </button>
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
