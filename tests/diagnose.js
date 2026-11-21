// Diagnostic: Test the full analysis pipeline with a real reel URL
import { fetchReelData } from '../server/services/instagramFetcher.js';
import { GeminiAnalyzer } from '../server/services/geminiAnalyzer.js';
import { PRESET_REELS } from '../server/data/presets.js';

const TEST_URLS = [
  'https://www.instagram.com/reel/DAGbvYvS-Ls/',
  'https://www.instagram.com/reel/C8XYZ123/',
];

async function diagnose() {
  console.log('===== DIAGNOSTIC: Instagram Fetcher =====\n');

  for (const url of TEST_URLS) {
    console.log(`--- Testing URL: ${url} ---`);
    try {
      const data = await fetchReelData(url);
      console.log('  shortcode:', data.shortcode);
      console.log('  caption:', JSON.stringify(data.caption?.substring(0, 200)));
      console.log('  author:', data.author);
      console.log('  videoUrl:', data.videoUrl ? 'YES' : 'null');
      console.log('  locationTag:', data.locationTag);
      console.log('  comments count:', data.comments?.length);
    } catch (err) {
      console.log('  FETCH ERROR:', err.message);
    }
    console.log('');
  }

  console.log('\n===== DIAGNOSTIC: Preset Demo Flow =====\n');
  
  for (const preset of PRESET_REELS) {
    console.log(`--- Preset: ${preset.id} (${preset.simulatedType}) ---`);
    console.log('  reelUrl:', preset.reelUrl);
    console.log('  caption:', preset.description?.substring(0, 100));
    console.log('  comments count:', preset.comments?.length);
    console.log('  expected place:', preset.expectedPlace?.placeName);
    console.log('');
  }

  console.log('\n===== DIAGNOSTIC: Gemini Analyzer (without key) =====\n');
  
  const analyzer = new GeminiAnalyzer(null);
  
  // Test what happens when calling analyzeCaption without a key
  try {
    await analyzer.analyzeCaption({ caption: 'test', author: 'test' });
  } catch (err) {
    console.log('  Expected error (no key):', err.message);
  }

  // Test what happens when calling with process.env.GEMINI_API_KEY
  console.log('  GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY.substring(0,8) + '...)' : 'NOT SET');

  console.log('\n===== DIAGNOSTIC: API route preset match =====\n');
  
  // Simulate what /api/analyze does when matching presets
  const testUrl = PRESET_REELS[0].reelUrl;
  const matched = PRESET_REELS.find(
    (p) => p.reelUrl.toLowerCase().trim() === testUrl.toLowerCase().trim() || p.id === testUrl
  );
  console.log('  Trying to match:', testUrl);
  console.log('  Matched:', matched ? matched.id : 'NO MATCH');

  // Now try with preset.id
  const matched2 = PRESET_REELS.find(
    (p) => p.reelUrl.toLowerCase().trim() === 'preset-video' || p.id === 'preset-video'
  );
  console.log('  Trying to match by id: preset-video');
  console.log('  Matched:', matched2 ? matched2.id : 'NO MATCH');

  console.log('\n===== END DIAGNOSTICS =====');
  process.exit(0);
}

diagnose().catch(err => { console.error('FATAL:', err); process.exit(1); });
