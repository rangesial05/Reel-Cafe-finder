import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'wishlist.json');

// Ensure data folder and file exist
function initStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    // Seed with a couple of aesthetic starter sample spots
    const initialData = [
      {
        id: 'sample-1',
        name: 'Subko Specialty Coffee & Bakehouse',
        category: 'Cafe',
        cityOrArea: 'Bandra West, Mumbai',
        formattedAddress: 'Subko, Mary Lodge, 21A, Chapel Rd, Ranwar, Bandra West, Mumbai',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Subko+Coffee+Bandra+Mumbai',
        rating: 4.7,
        coordinates: [19.0558, 72.8296],
        visited: false,
        notes: 'Famous for sourdough toast and iced pour over',
        savedAt: new Date().toISOString(),
        source: 'reel_analysis',
        reelUrl: 'https://www.instagram.com/reel/sample1/',
      },
      {
        id: 'sample-2',
        name: 'Dyu Art Cafe',
        category: 'Cafe',
        cityOrArea: 'Koramangala, Bangalore',
        formattedAddress: 'Dyu Art Cafe, 5th Block, Koramangala, Bengaluru',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dyu+Art+Cafe+Koramangala+Bangalore',
        rating: 4.6,
        coordinates: [12.9348, 77.6208],
        visited: true,
        notes: 'Traditional Kerala-style courtyard ambience, great chocolate cake',
        savedAt: new Date().toISOString(),
        source: 'reel_analysis',
        reelUrl: 'https://www.instagram.com/reel/sample2/',
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

export function getWishlist() {
  initStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading wishlist:', err);
    return [];
  }
}

export function saveWishlistItem(item) {
  initStore();
  const list = getWishlist();
  
  // Check if item with same name already exists
  const existingIndex = list.findIndex(
    (x) => x.name.toLowerCase().trim() === item.name.toLowerCase().trim()
  );

  const newItem = {
    id: item.id || `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: item.name,
    category: item.category || 'Cafe',
    cityOrArea: item.cityOrArea || '',
    formattedAddress: item.formattedAddress || item.name,
    googleMapsUrl: item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`,
    rating: item.rating || 4.5,
    coordinates: item.coordinates || [19.0760, 72.8777],
    visited: item.visited || false,
    notes: item.notes || '',
    savedAt: item.savedAt || new Date().toISOString(),
    reelUrl: item.reelUrl || null,
    detectionSource: item.detectionSource || null, // 'video' | 'caption' | 'comments'
  };

  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...newItem, id: list[existingIndex].id };
  } else {
    list.unshift(newItem);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  return newItem;
}

export function updateWishlistItem(id, updates) {
  initStore();
  const list = getWishlist();
  const index = list.findIndex((x) => x.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...updates };
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  return list[index];
}

export function deleteWishlistItem(id) {
  initStore();
  const list = getWishlist();
  const filtered = list.filter((x) => x.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf8');
  return true;
}
