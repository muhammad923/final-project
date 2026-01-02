
import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from "../types";

export const geminiService = {
  async getAiRecommendations(watchlist: Movie[], currentMood?: string) {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const favorites = watchlist.map(m => m.title).join(", ");

    const prompt = `I love these movies: ${favorites}. ${currentMood ? `My current mood is: ${currentMood}.` : ""} 
    Based on this, suggest 5 movies I might like. Provide valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING, description: "Why I should watch this based on my preferences" },
              year: { type: Type.STRING }
            },
            required: ["title", "reason"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  }
};
