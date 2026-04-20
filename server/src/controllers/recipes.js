const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function searchRecipes({ profiles, conversation = [] }) {
  // Build profile info
  let profileInfo = "No profiles specified.";
  if (profiles && profiles.length > 0) {
    profileInfo = profiles.map((p) => {
      return `${p.name}: Dietary Restrictions - ${p.dietary_restrictions || "none"}, Preferences - ${p.dietary_preferences || "none"}`;
    }).join("; ");
  }

  // Build conversation history
  let conversationText = "";
  if (conversation.length > 0) {
    conversationText = conversation.map((msg) => {
      return `${msg.role}: ${msg.content}`;
    }).join("\n");
  }

  const prompt = `You are an AI recipe chatbot. Your role is to help users find delicious recipes based on their needs in a conversational way.

Who's eating: ${profileInfo}

Conversation history:
${conversationText}

Respond as a friendly expert chef chatbot that is giving recipes to a not very proficient user in cooking. If this is the first message, acknowledge the profiles and the user's prompt, suggest 2-3 recipe ideas. For follow-up messages, continue the conversation naturally, refine suggestions based on new info, and provide more recipes if needed.

Always include recipe recommendations at the end of your response when appropriate.

Return ONLY a valid JSON object with this exact structure:
{
  "message": "Your chatbot response here",
  "estimatedTime": "Estimated total prep/cook time, e.g. 30 minutes",
  "suggestions": [
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "keyIngredients": ["1/4 cup flour", "2 large eggs"],
      "whyItFits": "Why this recipe matches their needs",
      "instructions": ["Step 1", "Step 2", ...],
      "tips": "Any special tips"
    }
  ]
}

- Always return between 2 and 3 suggestions.
- Each recipe must include ingredient measurements in "keyIngredients" (for example, "1/4 cup", "2 tsp", "3 slices").
- If no new suggestions are appropriate, set "suggestions" to an empty array, but still return "estimatedTime" and "message".
- Do not include any text outside the JSON object.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
    thinkingConfig: {
      thinkingBudget: 0 // Removes THINKING PROCESS
    }
  }
  });

  console.log("Token usage:", result.usageMetadata);
  console.log("Input tokens:", result.usageMetadata.promptTokenCount);
  console.log("Output tokens:", result.usageMetadata.candidatesTokenCount);
  console.log("Total tokens:", result.usageMetadata.totalTokenCount);

  const text = result.text;

  try {
    // Strip markdown code fences if Gemini wraps the JSON in them
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const response = JSON.parse(cleaned);
    return response;
  } catch (error) {
    throw new Error("Failed to parse chatbot response from AI: " + text);
  }
}

module.exports = {
  searchRecipes,
};