const Scan = require("../models/Scan");
const groq = require("../config/groq");

const analyzeEmail = async (req, res) => {
  try {
    const { emailText } = req.body;

    if (!emailText) {
      return res.status(400).json({
        message: "Email text is required",
      });
    }

    const prompt = `
You are an AI phishing detection assistant.

Analyze the following email text and decide if it is Safe, Suspicious, or High Risk.

Return ONLY valid JSON with this exact structure:
{
  "status": "Safe or Suspicious or High Risk",
  "riskScore": number between 0 and 100,
  "foundWords": ["word 1", "word 2"],
  "reasons": ["reason 1", "reason 2"],
  "recommendation": "short safety recommendation"
}

Email text:
${emailText}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });

    const aiText = completion.choices[0].message.content;
    const aiResult = JSON.parse(aiText);

    await Scan.create({
      user: req.user.id,
      type: "Email",
      content: emailText,
      status: aiResult.status,
      riskScore: aiResult.riskScore,
    });

    res.json({
      status: aiResult.status,
      riskScore: aiResult.riskScore,
      foundWords: aiResult.foundWords || [],
      reasons: aiResult.reasons || [],
      recommendation: aiResult.recommendation,
      message: "AI email analyzed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "AI email analysis failed",
    });
  }
};

const analyzeUrl = async (req, res) => {
  try {
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
      reasons.push("The URL contains words commonly used in phishing links.");
    }

    if (url.length > 80) {
      riskScore += 20;
      reasons.push("The URL is very long, which can hide suspicious content.");
    }

    let status = "Safe";

    if (riskScore >= 50) {
      status = "High Risk";
    } else if (riskScore >= 20) {
      status = "Suspicious";
    }

    await Scan.create({
      user: req.user.id,
      type: "URL",
      content: url,
      status,
      riskScore,
    });

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
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getScanHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(scans);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  analyzeEmail,
  analyzeUrl,
  getScanHistory,
};