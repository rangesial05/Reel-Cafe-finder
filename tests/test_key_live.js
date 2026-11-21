import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`;

async function testKey() {
  console.log('Testing gemini-3.8-flash...');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say hello and identify yourself.' }] }]
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response text:', data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data));
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

testKey();
