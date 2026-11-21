import { GeminiAnalyzer } from '../server/services/geminiAnalyzer.js';

// We can test calling gemini-3.8-flash via the server
async function testModel() {
  const payload = {
    reelUrl: 'https://www.instagram.com/reel/DeYoPO3TYns/',
    manualData: {
      caption: "Dining inside a Cave in Kolkata with incredible food & cocktails 🍹 \nLocation in pinned comment📍\n(Newly opened places in Kolkata, new in town, Kolkata cafés, aesthetic cafe in Kolkata)\n#cafesofkolkata #kolkata",
      author: "ahana__ray_",
      comments: [
        { text: "Where is this cave in Kolkata?", author: "foodie" },
        { text: "Location please?", author: "kolkata_eats" },
        { text: "Ahana you mentioned it yourself... that's cool of you", author: "viewer" }
      ]
    }
  };

  console.log('Testing with model gemini-3.8-flash...');
}
