import assert from 'assert';
import { extractShortcode } from '../server/services/instagramFetcher.js';
import { resolvePlace } from '../server/services/placesResolver.js';
import { getWishlist, saveWishlistItem, updateWishlistItem, deleteWishlistItem } from '../server/services/wishlistStore.js';
import { PRESET_REELS } from '../server/data/presets.js';

console.log('--- RUNNING REEL PLACE FINDER AUTOMATED TESTS ---');

// TEST 1: Shortcode extraction
console.log('Testing Instagram Shortcode Extraction...');
assert.strictEqual(extractShortcode('https://www.instagram.com/reel/C8XYZ123/?utm_source=ig_web_copy_link'), 'C8XYZ123');
assert.strictEqual(extractShortcode('https://instagram.com/reels/D9AbcDe_1/'), 'D9AbcDe_1');
assert.strictEqual(extractShortcode('https://www.instagram.com/p/B5testPost/'), 'B5testPost');
assert.strictEqual(extractShortcode('https://www.instagram.com/share/reel/F7Shared123/'), 'F7Shared123');
console.log('✅ Shortcode extraction passed.');

// TEST 2: Preset Demos
console.log('Testing Preset Demos for Tier 1, Tier 2, and Tier 3...');
assert.strictEqual(PRESET_REELS.length, 3);
assert.strictEqual(PRESET_REELS[0].simulatedType, 'video');
assert.strictEqual(PRESET_REELS[1].simulatedType, 'caption');
assert.strictEqual(PRESET_REELS[2].simulatedType, 'comments');
console.log('✅ Preset Demos passed.');

// TEST 3: Places Resolver and Google Maps URLs
console.log('Testing Places Resolver & Google Maps URL generation...');
(async () => {
  const resolved = await resolvePlace({
    placeName: 'Subko Specialty Coffee',
    cityOrArea: 'Bandra West, Mumbai',
    category: 'Cafe',
  });

  assert(resolved.googleMapsUrl.includes('google.com/maps/search/'));
  assert(resolved.googleMapsUrl.includes('Subko'));
  assert(resolved.googleMapsDirectionsUrl.includes('google.com/maps/dir/'));
  assert(Array.isArray(resolved.coordinates) && resolved.coordinates.length === 2);
  console.log(`✅ Places Resolver generated URL: ${resolved.googleMapsUrl}`);
  console.log(`✅ Coordinates resolved: [${resolved.coordinates.join(', ')}]`);

  // TEST 4: Wishlist Store Operations
  console.log('Testing Wishlist Store CRUD...');
  const testItem = {
    name: 'Unit Test Cafe ' + Date.now(),
    category: 'Cafe',
    cityOrArea: 'Indiranagar, Bangalore',
    visited: false,
    notes: 'Testing add note',
  };

  const saved = saveWishlistItem(testItem);
  assert(saved.id);
  assert.strictEqual(saved.name, testItem.name);

  // Update item
  const updated = updateWishlistItem(saved.id, { visited: true, notes: 'Visited!' });
  assert.strictEqual(updated.visited, true);
  assert.strictEqual(updated.notes, 'Visited!');

  // Delete item
  const deleted = deleteWishlistItem(saved.id);
  assert.strictEqual(deleted, true);

  const listAfter = getWishlist();
  assert(!listAfter.some((x) => x.id === saved.id));
  console.log('✅ Wishlist CRUD operations passed.');

  console.log('----------------------------------------------------');
  console.log('🎉 ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY! 🎉');
  console.log('----------------------------------------------------');
})();
