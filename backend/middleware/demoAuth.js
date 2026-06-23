const DEMO_AUTH_TOKEN = process.env.DEMO_AUTH_TOKEN || "kronopay-demo-token";

const demoUser = {
  id: "demo-user",
  name: "Demoanvändare",
  email: "demo@kronopay.se",
  personalNumber: "YYYYMMDD-XXXX",
  language: "sv",
  currency: "SEK",
  createdAt: "2026-06-23T00:00:00.000Z",
};

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return req.headers["x-demo-token"];
}

function requireDemoAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (token !== DEMO_AUTH_TOKEN) {
    return res.status(401).json({
      message: "Autentisering krävs",
    });
  }

  req.user = demoUser;
  next();
}

module.exports = {
  DEMO_AUTH_TOKEN,
  demoUser,
  requireDemoAuth,
};
