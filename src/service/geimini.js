
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_AI_API_KEY
});

const sentenceSchema = {
    type: "object",
    properties: {
        continuation: {
            type: "string",
            description: "Short natural sentence continuation"
        }
    },
    required: ["continuation"]
};

export default async function getSentencePrediction({lastMessage,currentText}) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
Last message in conversation::
"${lastMessage}"

User is currently typing:
"${currentText}"

Rules:
- Continue the user's sentence naturally
- Max 3 words
- Do NOT repeat typed words
- Lowercase only
- No punctuation
- emojis
- Return empty string if no good continuation
      `,
            config: {
                responseMimeType: "application/json",
                responseSchema: sentenceSchema
            }
        });

        return JSON.parse(response.text).continuation || "";
    } catch (err) {
        console.error("Sentence prediction error:", err);
        return "";
    }
};
