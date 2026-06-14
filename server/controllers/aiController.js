const groq = require("../config/groq");

const testAI = async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say hello from Groq AI",
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    res.json({
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "AI Error",
    });
  }
};

const analyzeEmailAI = async (req, res) => {
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
  "reasons": ["reason 1", "reason 2"],
  "recommendation": "short safety recommendation"
}

Email text:
${emailText}
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });

    const aiText = completion.choices[0].message.content;

    const parsedResult = JSON.parse(aiText);

    res.json({
      status: parsedResult.status,
      riskScore: parsedResult.riskScore,
      reasons: parsedResult.reasons,
      recommendation: parsedResult.recommendation,
      message: "AI email analysis completed successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "AI Email Analysis Error",
    });
  }
};

module.exports = {
  testAI,
  analyzeEmailAI,
};