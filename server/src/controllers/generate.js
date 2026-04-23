const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateText(req, res) {
  try {
    const { prompt } = req.body;
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return res.json({ response: result.text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateText,
};
