async function testTier2ViaServer() {
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

  console.log('Sending manualData to running server on port 5000...');
  const res = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testTier2ViaServer();
