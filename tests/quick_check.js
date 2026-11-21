import { fetchReelData } from '../server/services/instagramFetcher.js';

async function test() {
  const d = await fetchReelData('https://www.instagram.com/reel/DAGbvYvS-Ls/');
  console.log('fetchSuccess:', d.fetchSuccess);
  console.log('caption:', JSON.stringify(d.caption));
}
test();
