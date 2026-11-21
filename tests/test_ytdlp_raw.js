import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const YTDLP_PATH = path.join(__dirname, '../bin/yt-dlp.exe');

const cleanUrl = 'https://www.instagram.com/reel/DeYoPO3TYns/';
console.log('Running yt-dlp without quiet...');

const child = spawn(YTDLP_PATH, ['--dump-json', '--no-playlist', cleanUrl]);
let stdout = '';
let stderr = '';

child.stdout.on('data', (d) => { stdout += d; });
child.stderr.on('data', (d) => { stderr += d; });

child.on('close', (code) => {
  console.log('Exit code:', code);
  console.log('Stderr:', stderr);
  console.log('Stdout length:', stdout.length);
  if (stdout.length > 0) {
    try {
      const j = JSON.parse(stdout.trim());
      console.log('Parsed successfully! Title:', j.title, 'Uploader:', j.uploader);
      console.log('Description:', j.description?.substring(0, 100));
    } catch (e) {
      console.log('JSON parse error:', e.message);
    }
  }
});
