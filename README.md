# 📍 ReelSpotter — AI Reel Place Finder & Wishlist App

> An intelligent full-stack app that analyzes Instagram Reels featuring cafes and restaurants, pinpoints their exact location on Google Maps, and lets users curate a personal Wishlist.

---

## ✨ Core Highlights & 3-Tier Multi-Modal Pipeline

When a user pastes a reel link or shares a reel to ReelSpotter, it cascades through a 3-tier detection engine powered by Google Gemini:

```
[User Pastes Reel Link]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Tier 1: Watching the Reel (Video & Audio Scan)         │
│ Multimodal AI scans storefront neon signage, cup       │
│ logos, menu cards, street boards & voiceover mentions. │
└──────────────────────────┬─────────────────────────────┘
                           │ If inconclusive / low confidence
                           ▼
┌────────────────────────────────────────────────────────┐
│ Tier 2: Caption & Description Analysis                 │
│ Inspects post caption, tagged handles (@venue),       │
│ hashtags (#delhicafes), and Instagram location pins.   │
└──────────────────────────┬─────────────────────────────┘
                           │ If hidden to force engagement
                           ▼
┌────────────────────────────────────────────────────────┐
│ Tier 3: Comments & Creator Replies Q&A Scan            │
│ Scans top comments for "Where is this?" questions and  │
│ extracts verified creator replies or user answers.     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Google Maps Resolution & Place Card                    │
│ - Exact business name, category, formatted address     │
│ - 🗺️ Direct "Open in Google Maps" Deep Link             │
│ - 🚗 Instant Driving / Transit Directions               │
│ - ⭐ "Add to Wishlist" with notes & visited status      │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Leaflet (interactive maps)
- **Build Tool**: Vite
- **Backend**: Node.js, Express 5, Cheerio (OpenGraph & JSON-LD parser), Multer (video uploads)
- **AI Engine**: Google Gemini 2.0 Flash (`@google/genai` & REST API)
- **Storage**: Persistent JSON database (`server/data/wishlist.json`)
- **PWA**: Web Share Target API enabled (share reels directly from Instagram on mobile!)

---

## 🚀 Quickstart Guide

### 1. Start Full-Stack App
```bash
cd reel-place-finder
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 2. (Optional) Run in Dev Mode with Vite HMR
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend with Hot Module Replacement
npm run client
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 API Keys

1. **Gemini API Key**:
   - You can enter your Gemini API key directly in the web UI under **Settings** (top-right gear icon) — it is stored securely in your browser's `localStorage`.
   - Alternatively, add it to `.env` or set `GEMINI_API_KEY=your_key` in the environment.
   - Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

2. **Google Maps / Places (Zero-Cost)**:
   - ReelSpotter generates official Google Maps Universal Deep Links (`https://www.google.com/maps/search/?api=1&query=...`) without requiring any Google Maps billing account.
   - If you also have a `GOOGLE_PLACES_API_KEY`, ReelSpotter will automatically fetch live ratings, verified place IDs, and photos.

---

## 🧪 Testing

Run unit tests and end-to-end integration tests:
```bash
# Automated shortcode, places resolver, and CRUD tests
node tests/test_suite.js

# Full end-to-end server & cascade test
node tests/e2e_test.js
```
