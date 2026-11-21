async function testApis() {
  const shortcode = 'C8XYZ123';
  const url = `https://www.instagram.com/reel/${shortcode}/`;

  // Test RapidAPI-free or public proxy services
  const proxies = [
    `https://api.vkrdown.com/insta/?url=${encodeURIComponent(url)}`,
    `https://snapinsta.app/action.php`,
  ];

  for (const p of proxies) {
    try {
      console.log('Testing:', p);
      const res = await fetch(p, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      console.log('Status:', res.status);
    } catch (e) {
      console.log('Failed:', e.message);
    }
  }
}

testApis();
