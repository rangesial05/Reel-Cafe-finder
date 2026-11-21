import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const YTDLP_PATH = path.join(__dirname, '../bin/yt-dlp.exe');

export function fetchWithYtDlp(url) {
  return new Promise((resolve, reject) => {
    const cleanUrl = url.split('?')[0]; // clean tracking parameters
    console.log(`[yt-dlp] Invoking for: ${cleanUrl}`);

    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      cleanUrl,
    ];

    execFile(YTDLP_PATH, args, { maxBuffer: 10 * 1024 * 1024, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.warn(`[yt-dlp] Error: ${error.message}`);
        if (stderr) console.warn(`[yt-dlp] Stderr: ${stderr}`);
        return reject(error);
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
          comments,
          fetchSuccess: true,
          source: 'yt-dlp',
        });
      } catch (parseErr) {
        reject(new Error(`Failed to parse yt-dlp output: ${parseErr.message}`));
      }
    });
  });
}

// Test on user's reel
const testUrl = 'https://www.instagram.com/reel/DeYoPO3TYns/?hvrq=MWUzMjl6cHYxNmdkMA==';
fetchWithYtDlp(testUrl)
  .then((res) => {
    console.log('✅ SUCCESS! Extracted from user reel:');
    console.log('Shortcode:', res.shortcode);
    console.log('Author:', res.author);
    console.log('Caption preview:', res.caption.substring(0, 150));
    console.log('Comments count:', res.comments.length);
    console.log('Video stream URL:', res.videoUrl ? 'YES' : 'NO');
  })
  .catch((err) => {
    console.error('❌ FAILED:', err.message);
  });
