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

    const prompt = `
You are an AI phishing URL detection assistant.

Analyze the following URL and decide if it is Safe, Suspicious, or High Risk.

Look for:
- fake login pages
- suspicious domains
- misspelled brands
- missing HTTPS
- strange symbols
- long or confusing links
- credential stealing behavior
- financial or account verification traps

Return ONLY valid JSON with this exact structure:
{
  "status": "Safe or Suspicious or High Risk",
  "riskScore": number between 0 and 100,
  "reasons": ["reason 1", "reason 2"],
  "recommendation": "short safety recommendation"
}

URL:
${url}
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
      type: "URL",
      content: url,
      status: aiResult.status,
      riskScore: aiResult.riskScore,
    });

    res.json({
      status: aiResult.status,
      riskScore: aiResult.riskScore,
      reasons: aiResult.reasons || [],
      recommendation: aiResult.recommendation,
      message: "AI URL analyzed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "AI URL analysis failed",
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