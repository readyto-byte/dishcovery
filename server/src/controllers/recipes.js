const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function searchRecipes({ profiles, conversation = [] }) {
  // Build profile info
  let profileInfo = 'No profiles specified.';
  if (profiles && profiles.length > 0) {
    profileInfo = profiles.map(p => `${p.name}: Allergies - ${p.allergies.join(', ') || 'none'}, Preferences - ${p.dietary_preferences.join(', ') || 'none'}`).join('; ');
  }

  // Build conversation history
  let conversationText = '';
  if (conversation.length > 0) {
    conversationText = conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  const prompt = `You are an AI recipe chatbot. Your role is to help users find delicious recipes based on their needs in a conversational way.

Who's eating: ${profileInfo}

Conversation history:
${conversationText}

Respond as a friendly chatbot. If this is the first message, acknowledge the profiles and the user's prompt, suggest 2-3 recipe ideas. For follow-up messages, continue the conversation naturally, refine suggestions based on new info, and provide more recipes if needed.

Always include recipe recommendations at the end of your response when appropriate.

Return ONLY a valid JSON object with this exact structure:
{
  "message": "Your chatbot response here",
  "suggestions": [
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "keyIngredients": ["Ingredient 1", "Ingredient 2"],
      "whyItFits": "Why this recipe matches their needs",
      "instructions": ["Step 1", "Step 2", ...],
      "tips": "Any special tips"
    },
    ...
  ]
}

If no new suggestions, set suggestions to an empty array. Do not include any text outside the JSON object.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = result?.text ?? '';
  try {
    const response = JSON.parse(text);
    return response;
  } catch (error) {
    throw new Error('Failed to parse chatbot response from AI');
  }
}

module.exports = {
  searchRecipes,
};