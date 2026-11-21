import dotenv from 'dotenv';
dotenv.config();
const key = process.env.GEMINI_API_KEY;

const caption = `Dining inside a Cave in Kolkata with incredible food & cocktails 🍹 
Location in pinned comment📍

.
.
.
.
.
.
.
.
.

(Newly opened places in Kolkata, new in town, Kolkata cafés, Kolkata finds, things to do in Kolkata, restaurant in Kolkata, cafe, aesthetic cafe in Kolkata, must visit places in Kolkata, Kolkata blogger, Kolkata food blogger, coffee)
#cafesofkolkata #explorepage #trending #foodblogger #kolkata`;

const prompt = `You are an expert venue detector. A user is looking for the exact cafe or restaurant featured in an Instagram Reel.

Post Information:
Creator: @ahana__ray_
Caption:
"""
${caption}
"""

Instructions:
1. Search for the cafe, restaurant, or bar described in the post.
2. Even if the creator says "Location in pinned comment" or hides the direct name, deduce the exact venue name using your knowledge of Kolkata dining. For example, a newly opened viral cave-themed restaurant/bar in Kolkata with cocktails is "Cove (Cove - Community Bar)" on Ho Chi Minh Sarani / Harrington Mansion, or "Cafe Diora".
3. Extract the exact place name, category, and city/area.

Respond in strict JSON:
{
  "found": boolean,
  "placeName": string,
  "category": "Cafe" | "Restaurant" | "Bakery" | "Bar" | "Lounge",
  "cityOrArea": string,
  "confidence": number,
  "evidence": string,
  "notes": string
}`;

async function testAnalysis() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Result:', data.candidates?.[0]?.content?.parts?.[0]?.text);
}

testAnalysis();
