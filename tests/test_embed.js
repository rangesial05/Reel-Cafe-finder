async function testEmbed() {
  const shortcodes = ['DAGbvYvS-Ls', 'C8CoffeeVideoDemo', 'DA82-Y9S_test'];
  for (const sc of ['DAGbvYvS-Ls']) {
    const url = `https://www.instagram.com/reel/${sc}/embed/captioned/`;
    console.log('Fetching:', url);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Length:', text.length);
      console.log('Sample:', text.substring(0, 500));
      // Look for caption
      const hasCaption = text.includes('Caption') || text.includes('caption');
      console.log('Has caption keyword:', hasCaption);
      // Check if title or og:title has info
      const titleMatch = text.match(/<title>([^<]+)<\/title>/);
      console.log('Title:', titleMatch ? titleMatch[1] : 'none');
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testEmbed();
