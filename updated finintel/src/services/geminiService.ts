import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiService = {
  async getInsights(transactions: any[]) {
    if (transactions.length === 0) {
      return { insights: ["Add some transactions to get AI insights!"], healthScore: 0 };
    }

    const prompt = `Analyze these financial transactions and provide 3 concise, actionable insights and a financial health score (0-100).
    Transactions: ${JSON.stringify(transactions)}
    Return JSON format: { "insights": ["insight1", "insight2", "insight3"], "healthScore": 85 }`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('Gemini Insights Error:', error);
      return { insights: ["Failed to generate insights. Please try again later."], healthScore: 0 };
    }
  },

  async chat(message: string, transactions: any[], goals: any[]) {
    const prompt = `You are FinIntel, a smart financial assistant. 
    User Data:
    Recent Transactions: ${JSON.stringify(transactions.slice(0, 20))}
    Savings Goals: ${JSON.stringify(goals)}
    
    User Question: ${message}
    
    Provide personalized, helpful financial advice based on their data. 
    CRITICAL: Keep your response extremely brief, clean, and professional. Use bullet points for lists. Avoid long paragraphs.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
};
