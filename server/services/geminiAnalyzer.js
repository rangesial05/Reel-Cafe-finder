/**
 * 3-Tier Hierarchical Multi-Modal Analysis Engine using Google Gemini
 *
 * Tier 1: Watch the Reel (Video binary & Audio Voiceover)
 * Tier 2: Read Caption & Description (tagged handles, hashtags, signature concepts)
 * Tier 3: Search Comments (Q&A like "Where is this?", "What's the place called?")
 */

export class GeminiAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GeminiAnalyzer: No API key provided yet.');
    }
  }

  /**
   * Helper to call Gemini REST API with automatic multi-model fallback & retry
   */
  async generateContent(contents) {
    if (!this.apiKey) {
      throw new Error(
        'Gemini API key is required. Please set GEMINI_API_KEY in .env or provide it in the UI Settings.'
      );
    }

    // Models ordered by reliability & speed
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.8-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-pro-latest',
    ];

    let lastError = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      const body = {
        contents,
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          responseMimeType: 'application/json',
        },
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(25000),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            try {
              return JSON.parse(candidate);
            } catch {
              const cleaned = candidate.replace(/```json\n?|\n?```/g, '').trim();
              const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
              if (jsonMatch) return JSON.parse(jsonMatch[0]);
            }
          }
        }

        const errorText = await response.text();
        let errorJson;
        try { errorJson = JSON.parse(errorText); } catch {}
        const msg = errorJson?.error?.message || errorText || `HTTP ${response.status}`;
        lastError = new Error(`Model ${model}: ${msg}`);
        console.warn(`[GeminiAnalyzer] Model ${model} returned ${response.status}, trying fallback...`);
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiAnalyzer] Model ${model} network error: ${err.message}, trying fallback...`);
      }
    }

    throw lastError || new Error('All Gemini model fallbacks exhausted.');
  }

  /**
   * TIER 1: Video & Audio Analysis (Watching the Reel)
   */
  async analyzeVideo({ videoBase64, videoMime = 'video/mp4', audioTranscript, captionContext }) {
    const parts = [];

    if (videoBase64) {
      parts.push({
        inlineData: { mimeType: videoMime, data: videoBase64 },
      });
    }

    const promptText = `
You are an expert food & travel venue detective analyzing an Instagram Reel video.
Your task is to identify the EXACT name of the cafe, restaurant, bakery, bar, or dining spot shown.

${captionContext ? `Context from creator: "${captionContext}"` : ''}
${audioTranscript ? `Audio Transcript: "${audioTranscript}"` : ''}

Analyze the video frames and audio carefully:
1. Visual clues: Look for neon signs on walls, storefront signage, entrance facade, text on coffee cups, printed menus, coasters, napkins, staff uniforms, or bill folders.
2. Audio clues: Listen for the creator's voiceover mentioning the venue name or neighborhood.
3. Architecture & Concept: If a signature architectural concept is shown (e.g. cave-like architecture with cocktails, specific cafe interior), correlate with well-known spots.

Respond in strict JSON:
{
  "found": boolean,
  "placeName": string or null (the specific business name, e.g. "Cove" or "Subko Coffee"),
  "category": "Cafe" | "Restaurant" | "Bakery" | "Bar" | "Lounge" | "Other" | null,
  "cityOrArea": string or null (e.g. "Ho Chi Minh Sarani, Kolkata" or "Bandra, Mumbai"),
  "confidence": number (0.0 to 1.0),
  "evidence": string (describe the visual/audio clue where it was detected),
  "notes": string
}
If you cannot identify a specific business name with confidence >= 0.55, set "found": false.
`;

    parts.push({ text: promptText });
    return await this.generateContent([{ role: 'user', parts }]);
  }

  /**
   * TIER 2: Analyze Caption, Location Tag, and Hashtags
   */
  async analyzeCaption({ caption, author, locationTag }) {
    if (!caption && !locationTag) {
      return { found: false, reason: 'No caption or location tag available' };
    }

    const promptText = `
You are an expert culinary & travel detective analyzing an Instagram Reel post.
The goal is to determine the EXACT cafe, restaurant, or bar being recommended.

Post Information:
Creator: @${author || 'unknown'}
Location Tag: ${locationTag || 'None'}
Caption:
"""
${caption || ''}
"""

Instructions:
1. Search for explicit venue names or tagged handles (e.g. "@covekolkata", "@dyuartcafe").
2. Look for location markers (e.g. "📍 Place Name", "at Place Name").
3. Detect distinctive venue descriptions and signature concepts in a specific city:
   For example, if the caption says "Dining inside a Cave in Kolkata with incredible food & cocktails" -> identify the famous cave-concept dining venue in Kolkata (such as "Cove" / "Cove - Community Bar" on Ho Chi Minh Sarani / Harrington Mansion, or "Cafe Diora").
4. Extract the city, neighborhood, or street (e.g. Kolkata, Mumbai, Bangalore, Delhi).

Respond in strict JSON:
{
  "found": boolean,
  "placeName": string or null,
  "category": "Cafe" | "Restaurant" | "Bakery" | "Bar" | "Lounge" | "Other" | null,
  "cityOrArea": string or null,
  "confidence": number (0.0 to 1.0),
  "evidence": string,
  "notes": string
}
If you identify the specific venue with confidence >= 0.6, set "found": true.
`;

    return await this.generateContent([
      { role: 'user', parts: [{ text: promptText }] },
    ]);
  }

  /**
   * TIER 3: Analyze Comments & Author Replies
   */
  async analyzeComments({ comments, author, captionContext }) {
    if (!comments || comments.length === 0) {
      return { found: false, reason: 'No comments available to search' };
    }

    const commentsFormatted = comments
      .slice(0, 30)
      .map(
        (c, i) =>
          `${i + 1}. [${c.author || 'User'}${
            c.isAuthorReply ? ' (CREATOR REPLY)' : ''
          }]: ${c.text}`
      )
      .join('\n');

    const promptText = `
You are an expert detective analyzing the comments of an Instagram Reel about a cafe/restaurant.
${captionContext ? `Post Caption: "${captionContext}"` : ''}
Creator: @${author || 'creator'}

Comments list:
"""
${commentsFormatted}
"""

Instructions:
1. Find any comment or reply thread that specifically answers what place/cafe/restaurant this is.
2. Check if the creator (@${author}) or knowledgeable viewers name the place or address.
3. Extract the exact place name and city/area.

Respond in strict JSON:
{
  "found": boolean,
  "placeName": string or null,
  "category": "Cafe" | "Restaurant" | "Bakery" | "Bar" | "Lounge" | "Other" | null,
  "cityOrArea": string or null,
  "confidence": number (0.0 to 1.0),
  "evidence": string,
  "notes": string
}
`;

    return await this.generateContent([
      { role: 'user', parts: [{ text: promptText }] },
    ]);
  }

  /**
   * Full 3-Tier Cascade Orchestration:
   * 1. Video AI
   * 2. Caption AI
   * 3. Comments AI
   */
  async runCascade({
    videoBase64,
    videoMime,
    videoUrl,
    audioTranscript,
    caption,
    author,
    locationTag,
    comments,
  }) {
    const cascadeLog = [];

    // ── TIER 1: Watch the Reel (Video & Audio) ──────────────────
    cascadeLog.push({ tier: 1, name: 'Video AI Scan', status: 'running' });
    const hasVideoData = Boolean(videoBase64 || audioTranscript);

    if (hasVideoData) {
      try {
        console.log('[Cascade] Executing Tier 1: Video AI...');
        const t1 = await this.analyzeVideo({
          videoBase64,
          videoMime,
          audioTranscript,
          captionContext: caption,
        });

        if (t1?.found && t1?.confidence >= 0.55 && t1?.placeName) {
          cascadeLog[0] = {
            tier: 1,
            name: 'Video AI Scan',
            status: 'success',
            placeName: t1.placeName,
            evidence: t1.evidence,
            confidence: t1.confidence,
          };
          return { source: 'video', tier: 1, place: t1, cascadeLog };
        }

        cascadeLog[0] = {
          tier: 1,
          name: 'Video AI Scan',
          status: 'inconclusive',
          reason: t1?.notes || 'No clear signage or spoken name resolved in video frames.',
        };
      } catch (err) {
        console.warn('[Cascade] Tier 1 error:', err.message);
        cascadeLog[0] = {
          tier: 1,
          name: 'Video AI Scan',
          status: 'skipped_or_error',
          reason: err.message,
        };
      }
    } else {
      cascadeLog[0] = {
        tier: 1,
        name: 'Video AI Scan',
        status: 'skipped',
        reason: 'Video stream not loaded directly; progressing to Caption scan.',
      };
    }

    // ── TIER 2: Caption & Description Analysis ───────────────────
    cascadeLog.push({ tier: 2, name: 'Caption & Metadata Scan', status: 'running' });
    const hasCaptionData = Boolean(
      (caption && caption.trim().length > 3) || (locationTag && locationTag.trim())
    );

    if (hasCaptionData) {
      try {
        console.log('[Cascade] Executing Tier 2: Caption AI...');
        const t2 = await this.analyzeCaption({ caption, author, locationTag });

        if (t2?.found && t2?.confidence >= 0.55 && t2?.placeName) {
          cascadeLog[1] = {
            tier: 2,
            name: 'Caption & Metadata Scan',
            status: 'success',
            placeName: t2.placeName,
            evidence: t2.evidence,
            confidence: t2.confidence,
          };
          return { source: 'caption', tier: 2, place: t2, cascadeLog };
        }

        cascadeLog[1] = {
          tier: 2,
          name: 'Caption & Metadata Scan',
          status: 'inconclusive',
          reason: t2?.notes || 'Caption mentions venue concept but not definitive name.',
        };
      } catch (err) {
        console.warn('[Cascade] Tier 2 error:', err.message);
        cascadeLog[1] = {
          tier: 2,
          name: 'Caption & Metadata Scan',
          status: 'skipped_or_error',
          reason: err.message,
        };
      }
    } else {
      cascadeLog[1] = {
        tier: 2,
        name: 'Caption & Metadata Scan',
        status: 'skipped',
        reason: 'No caption available; progressing to Comments scan.',
      };
    }

    // ── TIER 3: Comments & Replies Q&A Analysis ──────────────────
    cascadeLog.push({ tier: 3, name: 'Comments Q&A Scan', status: 'running' });
    const hasCommentsData = Boolean(comments && comments.length > 0);

    if (hasCommentsData) {
      try {
        console.log('[Cascade] Executing Tier 3: Comments AI...');
        const t3 = await this.analyzeComments({
          comments,
          author,
          captionContext: caption,
        });

        if (t3?.found && t3?.confidence >= 0.55 && t3?.placeName) {
          cascadeLog[2] = {
            tier: 3,
            name: 'Comments Q&A Scan',
            status: 'success',
            placeName: t3.placeName,
            evidence: t3.evidence,
            confidence: t3.confidence,
          };
          return { source: 'comments', tier: 3, place: t3, cascadeLog };
        }

        cascadeLog[2] = {
          tier: 3,
          name: 'Comments Q&A Scan',
          status: 'inconclusive',
          reason: t3?.notes || 'No comments identified the venue name.',
        };
      } catch (err) {
        console.warn('[Cascade] Tier 3 error:', err.message);
        cascadeLog[2] = {
          tier: 3,
          name: 'Comments Q&A Scan',
          status: 'skipped_or_error',
          reason: err.message,
        };
      }
    } else {
      cascadeLog[2] = {
        tier: 3,
        name: 'Comments Q&A Scan',
        status: 'skipped',
        reason: 'No comments retrieved.',
      };
    }

    return {
      source: null,
      tier: null,
      place: null,
      cascadeLog,
      message: 'Could not identify the place across Video, Caption, or Comments.',
    };
  }
}
