import express from 'express';
import multer from 'multer';
import { parseReelInput, fetchReelData, downloadVideoBuffer } from '../services/instagramFetcher.js';
import { GeminiAnalyzer } from '../services/geminiAnalyzer.js';
import { resolvePlace } from '../services/placesResolver.js';
import {
  getWishlist,
  saveWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
} from '../services/wishlistStore.js';
import { PRESET_REELS } from '../data/presets.js';

const router = express.Router();

// Multer for video file upload (memory buffer up to 50MB)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ─── GET /api/config ─────────────────────────────────────────────────
router.get('/config', (req, res) => {
  res.json({
    hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasServerPlacesKey: Boolean(process.env.GOOGLE_PLACES_API_KEY),
  });
});

// ─── GET /api/presets ────────────────────────────────────────────────
router.get('/presets', (req, res) => {
  res.json(PRESET_REELS);
});

// ─── Helper: Preset demo runner ──────────────────────────────────────
async function buildPresetResponse(preset, activeApiKey, reelData) {
  const tierNum =
    preset.simulatedType === 'video'
      ? 1
      : preset.simulatedType === 'caption'
      ? 2
      : 3;

  if (activeApiKey) {
    try {
      const analyzer = new GeminiAnalyzer(activeApiKey);
      const cascadeResult = await analyzer.runCascade({
        caption: reelData.caption,
        author: reelData.author,
        locationTag: reelData.locationTag,
        comments: reelData.comments,
        audioTranscript: reelData.audioTranscript,
      });

      if (cascadeResult.place?.placeName) {
        const resolvedPlace = await resolvePlace({
          placeName: cascadeResult.place.placeName,
          cityOrArea: cascadeResult.place.cityOrArea,
          category: cascadeResult.place.category,
        });

        return {
          success: true,
          source: cascadeResult.source,
          tier: cascadeResult.tier,
          place: {
            ...resolvedPlace,
            confidence: cascadeResult.place.confidence,
            evidence: cascadeResult.place.evidence,
            detectionSource: cascadeResult.source,
          },
          cascadeLog: cascadeResult.cascadeLog,
          reelData,
        };
      }
    } catch (err) {
      console.warn('Live Gemini preset run failed, falling back to cached demo:', err.message);
    }
  }

  const place = await resolvePlace(preset.expectedPlace);
  return {
    success: true,
    source: preset.simulatedType,
    tier: tierNum,
    place: {
      ...place,
      confidence: 0.95,
      evidence: preset.expectedPlace.evidence,
      detectionSource: preset.simulatedType,
    },
    cascadeLog: [
      {
        tier: 1,
        name: 'Video AI Scan',
        status: tierNum === 1 ? 'success' : 'inconclusive',
        placeName: tierNum === 1 ? preset.expectedPlace.placeName : null,
        evidence:
          tierNum === 1
            ? preset.expectedPlace.evidence
            : 'No visible cafe signage detected in video frames.',
        confidence: tierNum === 1 ? 0.94 : 0.2,
      },
      {
        tier: 2,
        name: 'Caption & Metadata Scan',
        status:
          tierNum === 2 ? 'success' : tierNum === 1 ? 'skipped' : 'inconclusive',
        placeName: tierNum === 2 ? preset.expectedPlace.placeName : null,
        evidence:
          tierNum === 2
            ? preset.expectedPlace.evidence
            : 'Creator omitted place name from caption to boost comments.',
        confidence: tierNum === 2 ? 0.91 : 0.1,
      },
      {
        tier: 3,
        name: 'Comments Q&A Scan',
        status: tierNum === 3 ? 'success' : 'skipped',
        placeName: tierNum === 3 ? preset.expectedPlace.placeName : null,
        evidence:
          tierNum === 3
            ? preset.expectedPlace.evidence
            : 'Skipped (already found in previous tier)',
        confidence: tierNum === 3 ? 0.96 : null,
      },
    ],
    reelData,
    notice: 'Demo mode active. Add your Gemini API key in Settings for live custom reel scans!',
  };
}

// ─── POST /api/analyze ───────────────────────────────────────────────
router.post('/analyze', async (req, res) => {
  try {
    const { reelUrl, manualData, apiKey } = req.body;
    const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

    // Cache the user's API key on server process if provided
    if (apiKey && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = apiKey;
    }

    if (!reelUrl && !manualData) {
      return res.status(400).json({ error: 'Please provide either a Reel URL, caption text, or manual data.' });
    }

    const cleanUrl = (reelUrl || '').trim();

    // 1. Check if matches any demo presets
    const matchedPreset = PRESET_REELS.find(
      (p) => p.reelUrl.toLowerCase() === cleanUrl.toLowerCase() || p.id === cleanUrl
    );

    let reelData = {
      caption: '',
      author: '',
      comments: [],
      locationTag: '',
      videoUrl: null,
      audioTranscript: null,
    };

    if (matchedPreset) {
      reelData = {
        caption: matchedPreset.description,
        author: matchedPreset.author,
        comments: matchedPreset.comments,
        audioTranscript: matchedPreset.audioTranscript,
        locationTag: matchedPreset.expectedPlace.cityOrArea,
        videoUrl: null,
      };

      const demoResponse = await buildPresetResponse(matchedPreset, activeApiKey, reelData);
      return res.json(demoResponse);
    }

    // 2. Parse input: detect URL and/or text
    const { url: parsedUrl, accompanyingText } = parseReelInput(cleanUrl);

    if (accompanyingText && !reelData.caption) {
      reelData.caption = accompanyingText;
    }

    let videoBuffer = null;
    let fetchBlocked = false;

    // 3. Extract real reel data using yt-dlp / scrapers
    if (parsedUrl) {
      try {
        console.log(`[API /analyze] Fetching reel: ${parsedUrl}`);
        const fetched = await fetchReelData(parsedUrl);
        if (fetched.fetchSuccess) {
          if (fetched.caption) reelData.caption = fetched.caption;
          if (fetched.author) reelData.author = fetched.author;
          if (fetched.comments && fetched.comments.length > 0) reelData.comments = fetched.comments;
          if (fetched.videoUrl) {
            reelData.videoUrl = fetched.videoUrl;
            // Attempt to download video buffer so Tier 1 can actually watch it!
            videoBuffer = await downloadVideoBuffer(fetched.videoUrl);
          }
        } else {
          fetchBlocked = true;
        }
      } catch (err) {
        console.warn('[API /analyze] Fetch error:', err.message);
        fetchBlocked = true;
      }
    }

    // 4. Merge manual overrides if user provided them
    if (manualData) {
      if (manualData.caption && manualData.caption.trim()) {
        reelData.caption = manualData.caption.trim();
        fetchBlocked = false;
      }
      if (manualData.author && manualData.author.trim()) {
        reelData.author = manualData.author.trim();
      }
      if (manualData.comments && manualData.comments.length > 0) {
        reelData.comments = manualData.comments;
        fetchBlocked = false;
      }
    }

    // 5. Check if we have sufficient data
    const hasSufficientData = Boolean(
      (reelData.caption && reelData.caption.trim().length > 3) ||
      videoBuffer ||
      (reelData.comments && reelData.comments.length > 0)
    );

    if (fetchBlocked && !hasSufficientData) {
      return res.status(422).json({
        fetchBlocked: true,
        error:
          'Instagram requires login to view this reel directly. Simply paste the caption text or comments below, or drop the reel video, and Gemini AI will find it instantly!',
        parsedUrl,
      });
    }

    // 6. Check for Gemini API Key
    if (!activeApiKey) {
      return res.status(400).json({
        error:
          'Gemini API Key required to analyze custom reels. Please click "Set API Key" in the top-right header and paste your key (get a free one at aistudio.google.com/app/apikey).',
      });
    }

    // 7. Run 3-Tier AI Cascade
    console.log('[API /analyze] Running 3-Tier cascade with Gemini 2.0 Flash...');
    const analyzer = new GeminiAnalyzer(activeApiKey);
    const cascadeResult = await analyzer.runCascade({
      videoBase64: videoBuffer ? videoBuffer.toString('base64') : null,
      videoMime: 'video/mp4',
      videoUrl: reelData.videoUrl,
      audioTranscript: reelData.audioTranscript,
      caption: reelData.caption,
      author: reelData.author,
      locationTag: reelData.locationTag,
      comments: reelData.comments,
    });

    if (!cascadeResult.place?.placeName) {
      return res.json({
        success: false,
        message:
          'Could not identify the cafe/restaurant name from the reel. Please check if the name was mentioned in the caption or comments.',
        cascadeLog: cascadeResult.cascadeLog,
        reelData: {
          caption: reelData.caption?.substring(0, 300),
          author: reelData.author,
          commentsCount: reelData.comments?.length,
        },
      });
    }

    // 8. Resolve Google Maps & coordinates
    const resolvedPlace = await resolvePlace({
      placeName: cascadeResult.place.placeName,
      cityOrArea: cascadeResult.place.cityOrArea,
      category: cascadeResult.place.category,
    });

    res.json({
      success: true,
      source: cascadeResult.source,
      tier: cascadeResult.tier,
      place: {
        ...resolvedPlace,
        confidence: cascadeResult.place.confidence,
        evidence: cascadeResult.place.evidence,
        detectionSource: cascadeResult.source,
      },
      cascadeLog: cascadeResult.cascadeLog,
      reelData: {
        caption: reelData.caption?.substring(0, 300),
        author: reelData.author,
        commentsCount: reelData.comments?.length,
      },
    });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: err.message || 'Internal server error while analyzing reel.' });
  }
});

// ─── POST /api/upload-video ──────────────────────────────────────────
router.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const { caption, author, apiKey } = req.body;
    const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!file && !caption) {
      return res.status(400).json({ error: 'Please select a video file or provide caption text.' });
    }

    if (!activeApiKey) {
      return res.status(400).json({ error: 'Gemini API Key required. Click "Set API Key" in the top-right.' });
    }

    const analyzer = new GeminiAnalyzer(activeApiKey);
    const videoBase64 = file ? file.buffer.toString('base64') : null;
    const videoMime = file ? file.mimetype : 'video/mp4';

    const cascadeResult = await analyzer.runCascade({
      videoBase64,
      videoMime,
      caption: caption || '',
      author: author || '',
      comments: [],
    });

    if (!cascadeResult.place?.placeName) {
      return res.json({
        success: false,
        message: 'Could not identify the venue from the video frames or audio.',
        cascadeLog: cascadeResult.cascadeLog,
      });
    }

    const resolvedPlace = await resolvePlace({
      placeName: cascadeResult.place.placeName,
      cityOrArea: cascadeResult.place.cityOrArea,
      category: cascadeResult.place.category,
    });

    res.json({
      success: true,
      source: cascadeResult.source,
      tier: cascadeResult.tier,
      place: {
        ...resolvedPlace,
        confidence: cascadeResult.place.confidence,
        evidence: cascadeResult.place.evidence,
        detectionSource: cascadeResult.source,
      },
      cascadeLog: cascadeResult.cascadeLog,
    });
  } catch (err) {
    console.error('Error in /api/upload-video:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Wishlist endpoints ──────────────────────────────────────────────
router.get('/wishlist', (req, res) => res.json(getWishlist()));

router.post('/wishlist', (req, res) => {
  try {
    const saved = saveWishlistItem(req.body);
    res.json({ success: true, item: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/wishlist/:id', (req, res) => {
  const updated = updateWishlistItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item: updated });
});

router.delete('/wishlist/:id', (req, res) => {
  deleteWishlistItem(req.params.id);
  res.json({ success: true });
});

export default router;
