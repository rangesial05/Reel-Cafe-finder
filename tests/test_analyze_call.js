async function runTest() {
  const url = 'https://www.instagram.com/reel/DeYoPO3TYns/';
  console.log('Posting /api/analyze with user reel...');
  const t0 = Date.now();
  try {
    const res = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelUrl: url })
    });
    console.log(`Status: ${res.status} (took ${((Date.now() - t0)/1000).toFixed(1)}s)`);
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

runTest();
