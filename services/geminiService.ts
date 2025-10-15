
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const translateNepaliToEnglish = async (text: string): Promise<string> => {
  try {
    const prompt = `Translate the following Nepali text to English. Provide only the direct English translation without any additional explanations, headers, or formatting.

Nepali Text:
"${text}"

English Translation:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text using Gemini API.");
  }
};
