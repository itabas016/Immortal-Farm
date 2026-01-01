
import { GoogleGenAI } from "@google/genai";

// Always initialize with the process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches mystical wisdom from the Daoist Master using Gemini 3.
 */
export async function getImmortalWisdom(playerRank: string, language: string, currentPlant?: string) {
  try {
    const langPrompt = language === 'zh' ? "Respond in Chinese (Simplified)." : "Respond in English.";
    const prompt = `You are an ancient Daoist Master observing a player's spirit farm. 
    The player is at the rank of ${playerRank}. 
    ${currentPlant ? `They are currently growing ${currentPlant}.` : 'They are looking at their empty fields.'}
    Provide a short, mystical, and encouraging piece of wisdom (max 30 words) related to gardening and cultivation.
    ${langPrompt}
    Use a mix of mystical flavor where appropriate. Respond in a friendly, zen-like way.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.8,
      },
    });

    // Directly access the .text property from GenerateContentResponse
    return response.text || (language === 'zh' ? "仙道漫漫，唯勤是岸。" : "The path to immortality is long. Tend to your garden with a clear mind.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'zh' ? "仙道漫漫，唯勤是岸。" : "The path to immortality is long. Tend to your garden with a clear mind.";
  }
}

/**
 * Generates a random game event in JSON format.
 */
export async function generateRandomEvent() {
  try {
    const prompt = `Generate a random positive or negative event for a spirit farm game. 
    Return the response in JSON format with "title", "description", and "effect" (a string description of what happens).
    Example: {"title": "Qi Storm", "description": "A sudden surge of spiritual energy washes over the land.", "effect": "Double growth speed for 1 minute"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // Access .text property and trim for clean parsing
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Random Event Generation Failed:", error);
    return null;
  }
}
