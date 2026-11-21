import { fetchReelData } from '../server/services/instagramFetcher.js';

async function check() {
  const res = await fetchReelData('https://www.instagram.com/reel/DAGbvYvS-Ls/');
  console.log('Result:', JSON.stringify(res, null, 2));
}

check();
