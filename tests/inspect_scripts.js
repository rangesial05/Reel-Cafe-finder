import * as cheerio from 'cheerio';

async function inspectScripts() {
  const url = `https://www.instagram.com/reel/DAGbvYvS-Ls/embed/captioned/`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  [32, 57].forEach((idx) => {
    const s = $('script').eq(idx).html() || '';
    console.log(`\n=== SCRIPT ${idx} (Length: ${s.length}) ===`);
    // Search for shortcode or post info
    const scMatch = s.indexOf('DAGbvYvS-Ls');
    console.log('Contains shortcode?:', scMatch !== -1);
    if (scMatch !== -1) {
      console.log('Snippet around shortcode:', s.substring(Math.max(0, scMatch - 200), scMatch + 500));
    }
  });

  // Let's search across ALL scripts for DAGbvYvS-Ls
  $('script').each((i, el) => {
    const s = $(el).html() || '';
    if (s.includes('DAGbvYvS-Ls')) {
      console.log(`Script ${i} contains shortcode!`);
      const scIdx = s.indexOf('DAGbvYvS-Ls');
      console.log('Snippet:', s.substring(Math.max(0, scIdx - 100), scIdx + 300));
    }
  });
}

inspectScripts();
