import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Clipboard,
  Upload,
  Film,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function ReelInputSection({
  reelUrl,
  setReelUrl,
  onAnalyze,
  isAnalyzing,
  presets,
  onSelectPreset,
  onUploadVideo,
  fetchBlockedNotice,
}) {
  const [activeMode, setActiveMode] = useState('link'); // 'link' | 'video'
  const [captionText, setCaptionText] = useState('');
  const [commentsText, setCommentsText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // If a fetch is blocked by Meta, auto-switch focus to caption input
  useEffect(() => {
    if (fetchBlockedNotice) {
      setActiveMode('link');
    }
  }, [fetchBlockedNotice]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setReelUrl(text.trim());
      }
    } catch {
      // clipboard permission denied
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeMode === 'video' && selectedFile) {
      onUploadVideo(selectedFile, captionText);
      return;
    }

    // Parse comments if provided
    const parsedComments = commentsText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((text) => ({ text, author: 'viewer' }));

    onAnalyze({
      reelUrl: reelUrl.trim(),
      manualData: {
        caption: captionText.trim(),
        comments: parsedComments,
      },
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setActiveMode('video');
      }
    }
  };

  return (
    <div className="mb-8">
      {/* Hero Title */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] text-[#A1A1AA] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span>Multimodal 3-Tier AI Detection Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F5] tracking-tight leading-tight">
          Spot any cafe or restaurant from an{' '}
          <span className="bg-gradient-to-r from-[#FF5A36] to-[#FF6F4F] bg-clip-text text-transparent">
            Instagram Reel
          </span>
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-2 max-w-xl mx-auto leading-relaxed">
          AI inspects the reel video, reads the caption, or scans comments to locate the exact place on Google Maps and save it to your wishlist.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveMode('link')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all duration-150 ${
            activeMode === 'link'
              ? 'bg-[#FF5A36] text-white shadow-lg shadow-[#FF5A36]/25'
              : 'bg-[#1C1C20] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reel Link & Caption</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all duration-150 ${
            activeMode === 'video'
              ? 'bg-[#FF5A36] text-white shadow-lg shadow-[#FF5A36]/25'
              : 'bg-[#1C1C20] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Reel Video (Tier 1 AI)</span>
        </button>
      </div>

      {/* Main Input Card */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5A36]/20 to-[#FF6F4F]/10 rounded-[24px] blur-md opacity-25 group-hover:opacity-40 transition duration-300" />

          <div className="relative bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
            {activeMode === 'link' ? (
              <div className="space-y-4">
                {/* Reel URL Input */}
                <div>
                  <label className="block text-xs font-bold text-[#F4F4F5] mb-1.5 flex items-center justify-between">
                    <span>Instagram Reel Link or Shared Text</span>
                    <span className="text-[11px] text-[#A1A1AA] font-normal">Accepts reel URL or full share text</span>
                  </label>
                  <div className="flex items-center bg-[#242429] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-3.5 py-2.5 focus-within:border-[#FF5A36] focus-within:ring-1 focus-within:ring-[#FF5A36]/40 transition duration-150">
                    <Search className="w-4 h-4 text-[#A1A1AA] mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={reelUrl}
                      onChange={(e) => setReelUrl(e.target.value)}
                      placeholder="Paste link: https://www.instagram.com/reel/C.../ or text"
                      className="w-full bg-transparent text-sm text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none"
                    />
                    {reelUrl && (
                      <button
                        type="button"
                        onClick={() => setReelUrl('')}
                        className="text-xs text-[#A1A1AA] hover:text-[#F4F4F5] px-2 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      title="Paste from clipboard"
                      className="p-1.5 rounded-[8px] bg-[#1C1C20] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#2d2d34] border border-[rgba(255,255,255,0.06)] transition-all duration-150 ml-1"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meta Blocked Guidance Notice */}
                {fetchBlockedNotice && (
                  <div className="p-3.5 rounded-[16px] bg-[#1C1C20] border border-[#F59E0B]/40 text-[#F59E0B] text-xs flex items-start gap-2.5 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[#F59E0B]">Meta requires login to view this reel link directly</span>
                      <span className="text-[#F4F4F5]/80">
                        Simply copy the caption or comments from Instagram and paste them below. Gemini AI will immediately pinpoint the exact cafe on Google Maps!
                      </span>
                    </div>
                  </div>
                )}

                {/* Caption / Text Assist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#F4F4F5] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#FF5A36]" />
                      <span>Reel Caption or Place Clues (Optional / Recommended)</span>
                    </label>
                    <span className="text-[11px] text-[#A1A1AA]">Paste post text, tags, or hashtags</span>
                  </div>
                  <textarea
                    rows={2}
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="e.g. Best brunch at Veronica's in Bandra! Or paste the reel caption here..."
                    className="w-full text-xs p-3 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
                  />
                </div>

                {/* Comments Text */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Comments revealing the place (Optional — for Tier 3 Q&A scan):
                  </label>
                  <textarea
                    rows={2}
                    value={commentsText}
                    onChange={(e) => setCommentsText(e.target.value)}
                    placeholder="e.g. Where is this? -> It's Cafe Tesu in Delhi!"
                    className="w-full text-xs p-3 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
                  />
                </div>
              </div>
            ) : (
              /* Video File Upload Mode */
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#F4F4F5] mb-1">
                  Upload Reel Video (MP4) — Gemini AI watches the video & hears the audio!
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[16px] p-6 text-center transition cursor-pointer ${
                    dragActive
                      ? 'border-[#FF5A36] bg-[#FF5A36]/10'
                      : 'border-[rgba(255,255,255,0.12)] bg-[#242429] hover:border-[rgba(255,255,255,0.22)]'
                  }`}
                  onClick={() => document.getElementById('reel-video-file-input')?.click()}
                >
                  <input
                    id="reel-video-file-input"
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
                      <span className="text-sm font-bold text-white">{selectedFile.name}</span>
                      <span className="text-xs text-[#A1A1AA] tabular-nums">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB &bull; Click to change
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-[#FF5A36]" />
                      <span className="text-sm font-bold text-[#F4F4F5]">
                        Drag & drop reel video here, or click to browse
                      </span>
                      <span className="text-xs text-[#A1A1AA]">
                        Supports MP4, MOV, WebM up to 50MB
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Accompanying caption or notes (optional):
                  </label>
                  <input
                    type="text"
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="e.g. Creator visited a hidden coffee roaster in Bangalore..."
                    className="w-full text-xs p-2.5 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] mt-4">
              <span className="text-xs text-[#A1A1AA] hidden sm:inline">
                Powered by Gemini 2.0 Flash Multimodal Vision
              </span>

              <button
                type="submit"
                disabled={
                  isAnalyzing ||
                  (activeMode === 'link' && !reelUrl.trim() && !captionText.trim()) ||
                  (activeMode === 'video' && !selectedFile && !captionText.trim())
                }
                className="px-7 py-3 rounded-[12px] bg-[#FF5A36] hover:bg-[#FF6F4F] text-white text-sm font-bold shadow-lg shadow-[#FF5A36]/25 hover:shadow-[#FF5A36]/40 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Reel...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Spot Cafe on Google Maps</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 1-Click Demo Presets */}
        {presets && presets.length > 0 && (
          <div className="mt-5 text-center">
            <span className="text-xs text-[#A1A1AA] font-semibold block mb-2">
              Or test immediately with 1-click reel demos:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {presets.map((preset) => {
                const dotColor = {
                  video: 'bg-[#FF5A36]',
                  caption: 'bg-[#F59E0B]',
                  comments: 'bg-[#22C55E]',
                };
                const typeLabel = {
                  video: 'Tier 1: Video Scan',
                  caption: 'Tier 2: Caption Scan',
                  comments: 'Tier 3: Comments Scan',
                };

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setReelUrl(preset.reelUrl);
                      setCaptionText(preset.description || '');
                      onSelectPreset(preset);
                    }}
                    disabled={isAnalyzing}
                    className="px-3.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#1C1C20] hover:bg-[#242429] hover:border-[rgba(255,255,255,0.16)] text-[#F4F4F5] font-semibold transition-all duration-150 flex items-center gap-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${dotColor[preset.simulatedType] || 'bg-[#FF5A36]'}`} />
                    <span>{typeLabel[preset.simulatedType]}</span>
                    <span className="text-[#A1A1AA] font-normal">({preset.expectedPlace.placeName})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
