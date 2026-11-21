import * as cheerio from 'cheerio';

const url = 'https://www.instagram.com/reel/DeYoPO3TYns/';

async function dumpScript32() {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const s = $('script').eq(32).html() || '';
  console.log('Script 32 length:', s.length);
  const idx = s.indexOf('DeYoPO3TYns');
  if (idx !== -1) {
    console.log('Context around DeYoPO3TYns:\n', s.substring(Math.max(0, idx - 300), idx + 600));
  } else {
    console.log('Not found in script 32');
  }

  // Search ALL scripts for text / title
  $('script').each((i, el) => {
    const sc = $(el).html() || '';
    if (sc.includes('DeYoPO3TYns')) {
      const p = sc.indexOf('DeYoPO3TYns');
      console.log(`Script ${i} has shortcode at pos ${p}`);
      console.log(sc.substring(Math.max(0, p - 100), p + 200));
    }
  });
}

dumpScript32();
