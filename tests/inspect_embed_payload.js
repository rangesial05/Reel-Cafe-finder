import fs from 'fs';
import * as cheerio from 'cheerio';

async function inspectEmbedPayload() {
  const url = `https://www.instagram.com/reel/DAGbvYvS-Ls/embed/captioned/`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('--- Inspecting Elements in Embed HTML ---');

  // Check .Caption, .CaptionComments, blockquote, etc.
  console.log('Caption class:', $('.Caption').text());
  console.log('CaptionComments class:', $('.CaptionComments').text());
  console.log('CaptionUsername:', $('.CaptionUsername').text());
  console.log('blockquote text:', $('blockquote').text());

  // Search for JSON in scripts
  $('script').each((i, el) => {
    const s = $(el).html() || '';
    if (s.includes('shortcode_media') || s.includes('caption') || s.includes('accessibility_caption') || s.includes('video_url')) {
      console.log(`Script ${i} matches! Length:`, s.length);
      // Let's find snippets
      const capIdx = s.indexOf('"caption"');
      if (capIdx !== -1) {
        console.log('Snippet around "caption":', s.substring(Math.max(0, capIdx - 50), capIdx + 200));
      }
      const textIdx = s.indexOf('"text"');
      if (textIdx !== -1) {
        console.log('Snippet around "text":', s.substring(Math.max(0, textIdx - 50), textIdx + 200));
      }
    }
  });
}

inspectEmbedPayload();
