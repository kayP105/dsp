// test_api.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

console.log("--- API Key Test Script ---");
if (!apiKey) {
    console.error("🔴 ERROR: GEMINI_API_KEY not found in .env file. Please check the file.");
    process.exit(1);
}
console.log("🟢 SUCCESS: API Key found in .env file.");

const genAI = new GoogleGenerativeAI(apiKey);

async function runTest() {
    try {
        console.log("... Contacting Google AI with new model...");
        
        // --- THIS IS THE ONLY CHANGE ---
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 
        // -----------------------------

        const prompt = "In one sentence, what is the color of the sky?";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅");
        console.log("✅  SUCCESS! IT FINALLY WORKED!");
        console.log("✅  The issue was the model name.");
        console.log("✅  Gemini's Response:", text);
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅\n");

    } catch (error) {
        console.error("\n❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌");
        console.error("❌  FAILURE! Even with the new model name, the call failed.");
        console.error("❌  This is highly unusual. The issue may be regional or account-related.");
        console.error("❌  Detailed Error Message:", error.message);
        console.error("❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n");
    }
}

runTest();