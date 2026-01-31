
import { GoogleGenAI } from "@google/genai";

export interface ShoppingAdviceResponse {
  text: string;
  sources: any[];
}

export const getShoppingAdvice = async (items: any[], useSearch: boolean = false): Promise<ShoppingAdviceResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const validItems = items.filter(i => i.weight > 0 && i.priceEur > 0);
  if (validItems.length === 0) {
    return { text: "Please enter some product details first!", sources: [] };
  }

  const prompt = `
    As a shopping expert, analyze these grocery options and tell me which is the best value and why.
    
    Current scenario:
    ${validItems.map(i => `- ${i.name}: ${i.quantity} pack of ${i.weight}${i.unit} (Total: ${(i.unit === 'g' ? (i.weight * i.quantity) / 1000 : i.weight * i.quantity).toFixed(2)}kg) for ${i.priceEur}`).join('\n')}
    
    1. Identify the mathematical winner (lowest price per unit).
    2. Explain the savings simply.
    3. If search is enabled, compare these prices to typical market prices for similar items to tell me if this is a "good deal" or "standard price".
    
    Keep the tone professional yet friendly. Use markdown for bolding the winner.
  `;

  try {
    const config: any = {
      temperature: 0.7,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: config
    });

    const text = response.text || "I couldn't generate advice right now.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("entity was not found")) {
      return { text: "API Configuration error. Please check your credentials.", sources: [] };
    }
    return { 
      text: "I'm having trouble thinking right now. But look at the calculated labels below for the best price per kg!", 
      sources: [] 
    };
  }
};
