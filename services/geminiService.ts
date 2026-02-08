import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askRummySage = async (question: string): Promise<string> => {
  if (!apiKey) {
    return "I'm currently offline (API Key missing). Please check the configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: "You are the 'Rummy Sage', an expert Rummy card game referee and strategist. Keep answers concise (under 50 words), witty, and helpful. You speak with a slight casino dealer charm.",
      },
    });
    
    return response.text || "I couldn't read the cards on that one. Try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The spirits of the cards are silent right now. (Error connecting to AI)";
  }
};