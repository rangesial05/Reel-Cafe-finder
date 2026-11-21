import * as cheerio from 'cheerio';

const url = 'https://www.instagram.com/reel/DeYoPO3TYns/?hvrq=MWUzMjl6cHYxNmdkMA==';

async function testThisReel() {
  console.log('Testing reel URL:', url);

  // 1. Direct fetch
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    console.log('Direct fetch status:', res.status);
    const html = await res.text();
    console.log('HTML length:', html.length);
    const $ = cheerio.load(html);
    console.log('og:title:', $('meta[property="og:title"]').attr('content'));
    console.log('og:description:', $('meta[property="og:description"]').attr('content'));
    console.log('title tag:', $('title').text());
    console.log('og:video:', $('meta[property="og:video"]').attr('content'));

    // Check script contents
    $('script').each((i, el) => {
      const s = $(el).html() || '';
      if (s.includes('DeYoPO3TYns') && (s.includes('caption') || s.includes('text') || s.includes('video'))) {
        console.log(`Script ${i} mentions shortcode: length ${s.length}`);
      }
    });
  } catch (e) {
    console.log('Direct fetch error:', e.message);
  }

  // 2. Embed fetch
  try {
    const embedUrl = 'https://www.instagram.com/reel/DeYoPO3TYns/embed/captioned/';
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    console.log('\nEmbed fetch status:', res.status);
    const html = await res.text();
    console.log('Embed HTML length:', html.length);
    const $ = cheerio.load(html);
    console.log('Embed og:title:', $('meta[property="og:title"]').attr('content'));
    console.log('Embed og:description:', $('meta[property="og:description"]').attr('content'));
    console.log('Embed title:', $('title').text());
    console.log('Embed .Caption:', $('.Caption').text());
    console.log('Embed blockquote:', $('blockquote').text());

    // Search for any caption or text in scripts
    $('script').each((i, el) => {
      const s = $(el).html() || '';
      if (s.includes('shortcode_media') || s.includes('edge_media_to_caption') || s.includes('Caption')) {
        console.log(`Embed script ${i} mentions media: length ${s.length}`);
      }
    });
  } catch (e) {
    console.log('Embed error:', e.message);
  }
}

testThisReel();
