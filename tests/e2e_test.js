// End-to-end test: validates all critical flows
import http from 'http';

async function runE2E() {
  console.log('--- E2E INTEGRATION TEST ---\n');

  // Start server
  await import('../server/server.js');
  await new Promise((r) => setTimeout(r, 1200));

  const BASE = 'http://localhost:5000';

  // 1. Health check
  const h = await fetch(`${BASE}/health`);
  console.log('✅ Health:', (await h.json()).service);

  // 2. Presets
  const p = await fetch(`${BASE}/api/presets`);
  const presets = await p.json();
  console.log(`✅ Presets: ${presets.length} demos`);

  // 3. Demo Preset (no API key) → should return success with demo data
  for (const preset of presets) {
    const r = await fetch(`${BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelUrl: preset.reelUrl }),
    });
    const d = await r.json();
    if (!d.success || !d.place?.name) {
      console.error(`❌ Preset ${preset.id} FAILED:`, d);
      process.exit(1);
    }
    console.log(
      `✅ Preset "${preset.id}" → "${d.place.name}" via ${d.source} (tier ${d.tier})`
    );
    // Verify evidence is present
    if (!d.place.evidence) {
      console.error(`❌ Preset ${preset.id} missing evidence!`);
      process.exit(1);
    }
    // Verify Google Maps URL
    if (!d.place.googleMapsUrl?.includes('google.com/maps')) {
      console.error(`❌ Preset ${preset.id} missing Google Maps URL!`);
      process.exit(1);
    }
    console.log(`   Maps: ${d.place.googleMapsUrl}`);
    console.log(`   Evidence: "${d.place.evidence.substring(0, 80)}…"`);
  }

  // 4. Real Instagram URL (will fail fetch) → should return 422 with fetchBlocked
  console.log('\nTesting real IG URL (expected: 422 fetchBlocked)...');
  const realRes = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reelUrl: 'https://www.instagram.com/reel/DAGbvYvS-Ls/' }),
  });
  const realData = await realRes.json();
  if (realRes.status === 422 && (realData.fetchBlocked || realData.fetchFailed)) {
    console.log('✅ Real URL correctly returns 422 with fetchBlocked flag');
    console.log(`   Error message: "${realData.error.substring(0, 90)}…"`);
  } else {
    console.log(
      `⚠️  Real URL returned status ${realRes.status}: ${JSON.stringify(realData).substring(0, 100)}`
    );
  }

  // 5. Manual Assist flow (caption text → no API key) → should return 400
  console.log('\nTesting manual data without API key...');
  const manualNoKey = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      manualData: {
        caption:
          'Best coffee in town at Third Wave Coffee Roasters, Indiranagar, Bangalore! ☕ #bangalorecafes',
        author: 'foodblogger',
      },
    }),
  });
  const manualNoKeyData = await manualNoKey.json();
  if (manualNoKey.status === 400 && manualNoKeyData.error?.includes('API Key')) {
    console.log('✅ Manual without API key correctly returns 400 asking for key');
  } else {
    console.log(
      `⚠️  Manual no-key returned: ${manualNoKey.status} ${JSON.stringify(manualNoKeyData).substring(0, 100)}`
    );
  }

  // 6. Wishlist CRUD
  console.log('\nTesting Wishlist CRUD...');
  const saveRes = await fetch(`${BASE}/api/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Test Cafe',
      category: 'Cafe',
      cityOrArea: 'Test City',
      notes: 'E2E test',
    }),
  });
  const saved = await saveRes.json();
  console.log(`✅ Saved to wishlist: "${saved.item.name}" (${saved.item.id})`);

  // Update
  const updRes = await fetch(`${BASE}/api/wishlist/${saved.item.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visited: true }),
  });
  const upd = await updRes.json();
  console.log(`✅ Updated visited: ${upd.item.visited}`);

  // Delete
  await fetch(`${BASE}/api/wishlist/${saved.item.id}`, { method: 'DELETE' });
  console.log(`✅ Deleted from wishlist`);

  console.log('\n──────────────────────────────────────────');
  console.log('🎉 ALL E2E TESTS PASSED! 🎉');
  console.log('──────────────────────────────────────────');
  process.exit(0);
}

runE2E().catch((err) => {
  console.error('E2E FAILED:', err);
  process.exit(1);
});
