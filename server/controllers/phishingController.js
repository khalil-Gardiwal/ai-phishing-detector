const analyzeEmail = (req, res) => {
  const { emailText } = req.body;

  if (!emailText) {
    return res.status(400).json({
      message: "Email text is required",
    });
  }

  const phishingRules = [
    {
      word: "password",
      reason:
        "The email asks about a password, which can be a sign of credential theft.",
    },
    {
      word: "verify",
      reason:
        "The email asks the user to verify information, which is common in phishing.",
    },
    {
      word: "urgent",
      reason:
        "The email uses urgent language to pressure the user.",
    },
    {
      word: "suspended",
      reason:
        "The email threatens account suspension, which is a common phishing tactic.",
    },
    {
      word: "click here",
      reason:
        "The email asks the user to click a link, which may lead to a fake website.",
    },
    {
      word: "account locked",
      reason:
        "The email claims the account is locked to create fear.",
    },
    {
      word: "login",
      reason:
        "The email mentions login, which may be used to steal credentials.",
    },
    {
      word: "bank",
      reason:
        "The email mentions banking, which can indicate financial phishing.",
    },
    {
      word: "winner",
      reason:
        "The email claims the user is a winner, which is common in scams.",
    },
    {
      word: "prize",
      reason:
        "The email mentions a prize, which can be used to trick users.",
    },
  ];

  let riskScore = 0;
  let foundWords = [];
  let reasons = [];

  phishingRules.forEach((rule) => {
    if (emailText.toLowerCase().includes(rule.word)) {
      riskScore += 10;
      foundWords.push(rule.word);
      reasons.push(rule.reason);
    }
  });

  let status = "Safe";

  if (riskScore >= 50) {
    status = "High Risk";
  } else if (riskScore >= 20) {
    status = "Suspicious";
  }

  res.json({
    status,
    riskScore,
    foundWords,
    reasons,
    recommendation:
      status === "Safe"
        ? "This email looks safe, but always verify the sender before taking action."
        : "Do not click suspicious links, do not share passwords, and verify the sender through an official website.",
    message: "Email analyzed successfully",
  });
};

const analyzeUrl = (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "URL is required",
    });
  }

  let riskScore = 0;
  let reasons = [];

  if (!url.startsWith("https://")) {
    riskScore += 20;
    reasons.push("The URL does not use HTTPS.");
  }

  if (url.includes("@")) {
    riskScore += 20;
    reasons.push("The URL contains @ symbol, which can be suspicious.");
  }

  if (
    url.toLowerCase().includes("login") ||
    url.toLowerCase().includes("verify") ||
    url.toLowerCase().includes("secure")
  ) {
    riskScore += 20;
    reasons.push(
      "The URL contains words commonly used in phishing links."
    );
  }

  if (url.length > 80) {
    riskScore += 20;
    reasons.push(
      "The URL is very long, which can hide suspicious content."
    );
  }

  let status = "Safe";

  if (riskScore >= 50) {
    status = "High Risk";
  } else if (riskScore >= 20) {
    status = "Suspicious";
  }

  res.json({
    status,
    riskScore,
    reasons,
    recommendation:
      status === "Safe"
        ? "This URL looks safe, but always check the domain carefully."
        : "Do not open this link until you verify the official website.",
    message: "URL analyzed successfully",
  });
};

module.exports = {
  analyzeEmail,
  analyzeUrl,
};