
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_AI_API_KEY,
});

const suggestionsSchema = {
  type: "array",
  items: { type: "string" },
};

function hasEmoji(str) {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
}

function splitIntoSentences(text) {
  // split by sentence ending punctuation or newlines
  const parts = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

function truncateSentenceWords(sentence, maxWords = 8) {
  const words = sentence.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

export default async function getSentencePrediction({ lastMessage, currentText }) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Last message in conversation:
"${lastMessage}"

User is currently typing:
"${currentText}"

Instructions:
- Return a JSON array of 3 suggestion strings. Example: ["short suggestion 😊 second sentence 👍", "...", "..."]
- Each suggestion must contain 2 to 3 sentences.
- Each sentence must be at most 8 words.
- Include at least one emoji in each suggestion.
- Keep suggestions natural, friendly, and concise.
- Do NOT include any extra fields or comments - return JSON array only.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionsSchema,
      },
    });

    let suggestions = JSON.parse(response.text);
    if (!Array.isArray(suggestions)) suggestions = [];

    // Post-process to enforce sentence/word limits and emoji presence
    const processed = suggestions.slice(0, 3).map((s) => {
      if (typeof s !== "string") s = String(s || "");
      // normalize whitespace
      s = s.replace(/\s+/g, " ").trim();

      let sents = splitIntoSentences(s);

      // If only one sentence found, try to split by words into 2 sentences
      if (sents.length === 1) {
        const words = sents[0].split(/\s+/).filter(Boolean);
        if (words.length > 8) {
          const first = words.slice(0, 8).join(" ");
          const second = words.slice(8, 16).join(" ");
          sents = [first];
          if (second) sents.push(second);
        }
      }

      // Ensure 2-3 sentences
      if (sents.length < 2) {
        // pad by splitting words
        const words = s.split(/\s+/).filter(Boolean);
        const out = [];
        for (let i = 0; i < Math.min(3, Math.ceil(words.length / 1)); i++) {
          const chunk = words.slice(i * 8, (i + 1) * 8);
          if (chunk.length) out.push(chunk.join(" "));
          if (out.length >= 2) break;
        }
        sents = out.length ? out : [truncateSentenceWords(s, 8)];
      }

      // Limit to 3 sentences and each to 8 words
      sents = sents.slice(0, 3).map((sent) => truncateSentenceWords(sent, 8));

      let final = sents.join(" ").trim();

      // Ensure emoji presence
      if (!hasEmoji(final)) {
        final = `${final} 😊`;
      }

      return final;
    });

    return processed;
  } catch (err) {
    console.error("Sentence prediction error:", err);
    return [];
  }
};
