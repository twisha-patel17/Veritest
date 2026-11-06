
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const main = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  console.log("Sending request to Gemini...");

  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Gemini request timed out after 45 seconds"));
    }, 45000);
  });

  const request = ai.interactions.create({
    model: "gemini-3.8-flash",
    input: "Reply with exactly: Veritest connected!",
  });

  const interaction = await Promise.race([request, timeout]);

  console.log("Gemini response:", interaction.output_text);
};

main().catch((error) => {
  console.error("Gemini connection failed:", error.message);
});
