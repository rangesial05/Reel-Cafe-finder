import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const YTDLP_PATH = path.join(__dirname, '../bin/yt-dlp.exe');

export function extractReelWithYtDlp(url) {
  return new Promise((resolve, reject) => {
    // Strip query parameters
    const cleanUrl = url.split('?')[0];
    console.log('[yt-dlp] Fetching metadata for:', cleanUrl);

    const child = spawn(YTDLP_PATH, ['--dump-json', '--no-playlist', cleanUrl]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    child.on('close', (code) => {
      if (stdout.trim().length === 0) {
        return reject(new Error(`yt-dlp failed (code ${code}): ${stderr}`));
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
        reject(new Error(`Failed to parse yt-dlp JSON: ${err.message}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Test extracting user's reel
const userUrl = 'https://www.instagram.com/reel/DeYoPO3TYns/?hvrq=MWUzMjl6cHYxNmdkMA==';
extractReelWithYtDlp(userUrl).then((reel) => {
  console.log('--- REEL EXTRACTED ---');
  console.log('Shortcode:', reel.shortcode);
  console.log('Author:', reel.author);
  console.log('Caption:', reel.caption);
  console.log('Comments count:', reel.comments.length);
  console.log('Sample comments:', reel.comments.slice(0, 5));
}).catch(console.error);
