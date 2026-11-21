import dotenv from 'dotenv';
dotenv.config();
const key = process.env.GEMINI_API_KEY;

const modelsToTest = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash-lite',
  'gemini-3.8-flash',
  'gemini-2.5-pro',
  'gemini-pro-latest'
];

async function findActiveModel() {
  for (const m of modelsToTest) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello, respond with: OK' }] }] })
      });
      const data = await res.json();
      console.log(`Model [${m}] Status: ${res.status}`);
      if (res.ok) {
        console.log(`🎉 SUCCESS with [${m}]:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
        return m;
      } else {
        console.log(`   Error:`, data.error?.message?.substring(0, 80));
      }
    } catch (e) {
      console.log(`Model [${m}] Fetch error:`, e.message);
    }
  }
}

findActiveModel();
