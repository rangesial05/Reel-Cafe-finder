async function testServices() {
  const shortcode = 'DAGbvYvS-Ls';
  const reelUrl = `https://www.instagram.com/reel/${shortcode}/`;

  console.log('Testing Rapid / Public endpoints...');

  // Test 1: Instagram GraphQL query doc_id / public query hash
  try {
    const res = await fetch(`https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables={"shortcode":"${shortcode}"}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
      }
    });
    console.log('IG GraphQL status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('GraphQL data keys:', Object.keys(data));
      if (data.data?.shortcode_media) {
        console.log('Found media caption:', data.data.shortcode_media.edge_media_to_caption?.edges?.[0]?.node?.text);
      }
    }
  } catch (err) {
    console.log('GraphQL failed:', err.message);
  }

  // Test 2: Cobalt public API
  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: reelUrl })
    });
    console.log('Cobalt status:', cobaltRes.status);
    if (cobaltRes.ok) {
      const cData = await cobaltRes.json();
      console.log('Cobalt data:', cData);
    }
  } catch (err) {
    console.log('Cobalt failed:', err.message);
  }
}

testServices();
