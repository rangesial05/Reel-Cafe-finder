async function testUserReelEndpoint() {
  const url = 'https://www.instagram.com/reel/DeYoPO3TYns/?hvrq=MWUzMjl6cHYxNmdkMA==';
  console.log('Sending request to /api/analyze with user reel...');

  try {
    const res = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelUrl: url })
    });
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testUserReelEndpoint();
