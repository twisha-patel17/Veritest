
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const genAI = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 20000,
    retryOptions: {
      attempts: 1,
      initialDelay: 1000,
      maxDelay: 3000,
      expBase: 2,
      httpStatusCodes: [408, 429, 500, 502, 503, 504],
    },
  },
});

module.exports = genAI;

