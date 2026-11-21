import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const YTDLP_PATH = path.join(__dirname, '../../bin/yt-dlp.exe');

/**
 * Parses any user input to extract an Instagram shortcode, URL, and accompanying text.
 */
export function parseReelInput(input) {
  if (!input || typeof input !== 'string') {
    return { url: null, shortcode: null, accompanyingText: '' };
  }

  const trimmed = input.trim();
  const urlRegex = /(https?:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p|share\/reel)\/([a-zA-Z0-9_-]+)[^\s]*)/i;
  const match = trimmed.match(urlRegex);

  if (match) {
    const fullUrl = match[1];
    const shortcode = match[2];
    const textWithoutUrl = trimmed.replace(match[0], '').trim();
    return {
      url: `https://www.instagram.com/reel/${shortcode}/`,
      shortcode,
      accompanyingText: textWithoutUrl,
    };
  }

  return {
    url: null,
    shortcode: null,
    accompanyingText: trimmed,
  };
}

export function extractShortcode(url) {
  return parseReelInput(url).shortcode;
}

/**
 * Strategy 1 (Primary): Use local yt-dlp binary to extract complete reel metadata & video URL
 */
function fetchWithYtDlp(url) {
  return new Promise((resolve, reject) => {
    const cleanUrl = url.split('?')[0];
    console.log(`[yt-dlp] Invoking yt-dlp for: ${cleanUrl}`);

    const args = [
      '--dump-json',
      '--no-playlist',
      '--socket-timeout',
      '35',
      '--retries',
      '3',
      '--no-check-certificates',
      cleanUrl,
    ];

    const child = spawn(YTDLP_PATH, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    child.on('close', (code) => {
      if (stdout.trim().length === 0) {
        return reject(new Error(`yt-dlp returned no output (code ${code}): ${stderr}`));
      }

      try {
        const data = JSON.parse(stdout.trim());
        const comments = (data.comments || []).map((c) => ({
          text: c.text,
          author: c.author || 'viewer',
          isAuthorReply: c.author === data.channel || c.author === data.uploader_id,
        }));

        resolve({
          shortcode: data.id,
          url: cleanUrl,
          caption: data.description || data.title || '',
          author: data.channel || data.uploader || '',
          videoUrl: data.url || null,
          thumbnail: data.thumbnail || null,
          comments,
          fetchSuccess: true,
          source: 'yt-dlp',
        });
      } catch (err) {
        reject(new Error(`yt-dlp JSON parse error: ${err.message}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Downloads video buffer for Tier 1 analysis
 */
export async function downloadVideoBuffer(videoUrl) {
  if (!videoUrl) return null;
  try {
    console.log('[downloadVideoBuffer] Fetching video stream...');
    const res = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
      },
      signal: AbortSignal.timeout(35000),
    });

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      console.log(`[downloadVideoBuffer] Downloaded ${(buffer.length / (1024 * 1024)).toFixed(2)} MB video buffer`);
      return buffer;
    }
  } catch (err) {
    console.warn('[downloadVideoBuffer] Failed to download video buffer:', err.message);
  }
  return null;
}

/**
 * Main Reel Fetcher:
 * 1. Tries yt-dlp first (extracts caption, uploader, comments, video stream)
 * 2. Tries public embed / HTML scraping as fallback
 */
export async function fetchReelData(url) {
  const { shortcode, url: standardUrl } = parseReelInput(url);
  if (!shortcode) {
    throw new Error('Invalid Instagram Reel URL. Please provide a link like https://www.instagram.com/reel/C.../');
  }

  // 1. Primary Strategy: yt-dlp
  try {
    const ytdlpData = await fetchWithYtDlp(standardUrl);
    if (ytdlpData && (ytdlpData.caption || ytdlpData.videoUrl)) {
      console.log(`[fetchReelData] Successfully extracted via yt-dlp: "${ytdlpData.caption.substring(0, 80)}..."`);
      return ytdlpData;
    }
  } catch (err) {
    console.warn('[fetchReelData] yt-dlp failed, falling back to HTML scraping:', err.message);
  }

  // 2. Fallback: embed/captioned HTML scrape
  let caption = '';
  let author = '';
  try {
    const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/captioned/`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      const capText = $('.Caption')?.text()?.trim() || $('.CaptionContent')?.text()?.trim() || '';
      if (capText && capText !== 'Instagram') caption = capText;

      const authText = $('.UsernameText')?.text()?.trim() || $('.CaptionUsername')?.text()?.trim() || '';
      if (authText) author = authText.replace(/^@/, '');
    }
  } catch (err) {
    console.warn('[fetchReelData] Embed fallback error:', err.message);
  }

  const hasData = Boolean(caption && caption.length > 3 && caption.toLowerCase() !== 'instagram');

  return {
    shortcode,
    url: standardUrl,
    caption: hasData ? caption : '',
    videoUrl: null,
    author: author || null,
    comments: [],
    fetchSuccess: hasData,
    source: 'html_fallback',
  };
}
