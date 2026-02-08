import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}
  
  try {
    // @ts-ignore
    if (import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}
  
  return '';
};

const initializeAI = () => {
  if (ai) return ai;
  
  const key = getApiKey();
  if (key) {
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
};

export const askRummySage = async (question: string): Promise<string> => {
  const client = initializeAI();
  
  if (!client) {
    return "I'm currently offline (API Key missing). Please check the configuration.";
  }

  try {
    const response = await client.models.generateContent({
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