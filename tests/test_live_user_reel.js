async function testLiveUserReel() {
  const url = 'https://www.instagram.com/reel/DeYoPO3TYns/?hvrq=MWUzMjl6cHYxNmdkMA==';
  console.log('Sending request to live server for user reel:', url);
  const t0 = Date.now();

  try {
    const res = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelUrl: url })
    });

    console.log(`HTTP Status: ${res.status} (took ${((Date.now() - t0)/1000).toFixed(1)}s)`);
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testLiveUserReel();
