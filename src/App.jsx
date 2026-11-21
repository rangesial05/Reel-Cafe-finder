import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReelInputSection from './components/ReelInputSection';
import CascadeTracker from './components/CascadeTracker';
import PlaceResultCard from './components/PlaceResultCard';
import WishlistView from './components/WishlistView';
import SettingsModal from './components/SettingsModal';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('finder');
  const [reelUrl, setReelUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTier, setActiveTier] = useState(1);
  const [cascadeLog, setCascadeLog] = useState(null);
  const [placeResult, setPlaceResult] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [presets, setPresets] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [googlePlacesKey, setGooglePlacesKey] = useState('');
  const [toast, setToast] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fetchBlockedNotice, setFetchBlockedNotice] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    const savedGemini = localStorage.getItem('GEMINI_API_KEY') || '';
    const savedPlaces = localStorage.getItem('GOOGLE_PLACES_KEY') || '';
    setGeminiKey(savedGemini);
    setGooglePlacesKey(savedPlaces);
    fetchWishlist();
    fetchPresets();

    // Check PWA Web Share Target parameters (?url=... or ?text=...)
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    if (sharedUrl) {
      setReelUrl(sharedUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) setWishlist(await res.json());
    } catch (err) {
      console.warn('Wishlist load error:', err);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      if (res.ok) setPresets(await res.json());
    } catch (err) {
      console.warn('Presets load error:', err);
    }
  };

  // ── Main Analyze Reel Action ─────────────────────────────────────
  const handleAnalyze = async ({ reelUrl: inputUrl, manualData }) => {
    // If analyzing a custom reel and no Gemini API key is configured yet, auto-open Settings
    const isPreset = presets.some(
      (p) => p.reelUrl.toLowerCase() === (inputUrl || '').toLowerCase().trim() || p.id === inputUrl
    );

    if (!isPreset && !geminiKey) {
      setIsSettingsOpen(true);
      showToast('Please enter your Gemini API key to analyze custom reels', 'info');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setPlaceResult(null);
    setFetchBlockedNotice(false);

    setCascadeLog([
      { tier: 1, name: 'Video AI Scan', status: 'running' },
      { tier: 2, name: 'Caption & Metadata Scan', status: 'waiting' },
      { tier: 3, name: 'Comments Q&A Scan', status: 'waiting' },
    ]);
    setActiveTier(1);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelUrl: inputUrl,
          manualData,
          apiKey: geminiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fetchBlocked) {
          setFetchBlockedNotice(true);
          setCascadeLog(null);
        }
        throw new Error(data.error || 'Failed to analyze reel');
      }

      if (data.cascadeLog) setCascadeLog(data.cascadeLog);

      if (data.success && data.place) {
        setPlaceResult(data.place);
        showToast(`Found "${data.place.name}" via ${data.source}!`, 'success');
      } else {
        setErrorMsg(
          data.message ||
            'Could not identify the place. Please paste the caption text or comments above for AI analysis.'
        );
        showToast('Venue not found', 'error');
      }

      if (data.notice) {
        showToast(data.notice, 'info');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Upload video file directly ───────────────────────────────────
  const handleUploadVideo = async (file, caption) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setPlaceResult(null);
    setFetchBlockedNotice(false);

    setCascadeLog([
      { tier: 1, name: 'Video AI Scan', status: 'running' },
      { tier: 2, name: 'Caption & Metadata Scan', status: 'waiting' },
      { tier: 3, name: 'Comments Q&A Scan', status: 'waiting' },
    ]);
    setActiveTier(1);

    try {
      const formData = new FormData();
      formData.append('video', file);
      if (caption) formData.append('caption', caption);
      if (geminiKey) formData.append('apiKey', geminiKey);

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze video');

      if (data.cascadeLog) setCascadeLog(data.cascadeLog);

      if (data.success && data.place) {
        setPlaceResult(data.place);
        showToast(`Identified "${data.place.name}" from video!`, 'success');
      } else {
        setErrorMsg(data.message || 'Could not identify place in video.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setReelUrl(preset.reelUrl);
    handleAnalyze({ reelUrl: preset.reelUrl });
  };

  const handleSaveWishlist = async (place) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...place, reelUrl: reelUrl || null }),
      });
      if (res.ok) {
        showToast(`Saved "${place.name}" to Wishlist!`, 'success');
        fetchWishlist();
      }
    } catch {
      showToast('Failed to save to wishlist', 'error');
    }
  };

  const handleUpdateWishlist = async (id, updates) => {
    try {
      await fetch(`/api/wishlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchWishlist();
    } catch {
      showToast('Failed to update place', 'error');
    }
  };

  const handleDeleteWishlist = async (id) => {
    try {
      await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      showToast('Place removed from wishlist', 'info');
      fetchWishlist();
    } catch {
      showToast('Failed to delete place', 'error');
    }
  };

  const handleSaveGeminiKey = (key) => {
    setGeminiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
    showToast(key ? 'Gemini API key saved!' : 'Gemini API key cleared');
    if (key && reelUrl.trim()) {
      setTimeout(() => {
        handleAnalyze({ reelUrl: reelUrl.trim() });
      }, 500);
    }
  };

  const handleSaveGooglePlacesKey = (key) => {
    setGooglePlacesKey(key);
    localStorage.setItem('GOOGLE_PLACES_KEY', key);
  };

  const isPlaceInWishlist = (name) => {
    if (!name) return false;
    return wishlist.some(
      (x) => x.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  return (
    <div className="min-h-screen bg-[#121214] text-[#F4F4F5] flex flex-col selection:bg-[#FF5A36]/30">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-[16px] shadow-2xl text-xs font-bold border flex items-center gap-2 max-w-sm backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-[#1C1C20] text-[#22C55E] border-[#22C55E]/40'
                : toast.type === 'error'
                ? 'bg-[#1C1C20] text-[#FF5A36] border-[#FF5A36]/40'
                : 'bg-[#1C1C20] text-[#F4F4F5] border-[rgba(255,255,255,0.16)]'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wishlistCount={wishlist.length}
        openSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(geminiKey)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'finder' ? (
          <div>
            {/* Input Section */}
            <ReelInputSection
              reelUrl={reelUrl}
              setReelUrl={setReelUrl}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              presets={presets}
              onSelectPreset={handleSelectPreset}
              onUploadVideo={handleUploadVideo}
              fetchBlockedNotice={fetchBlockedNotice}
            />

            {/* Error Message */}
            {errorMsg && (
              <div className="max-w-3xl mx-auto mb-6 p-4 rounded-[16px] bg-[#1C1C20] border border-[#FF5A36]/40 text-[#F4F4F5] text-sm flex items-start gap-2.5 shadow-xl">
                <AlertCircle className="w-5 h-5 shrink-0 text-[#FF5A36] mt-0.5" />
                <div className="flex-1">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{errorMsg}</p>
                  {!geminiKey && errorMsg.includes('Gemini API Key') && (
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="mt-2 block underline font-semibold text-[#FF5A36] hover:text-[#FF6F4F] transition-colors"
                    >
                      Click here to enter your Gemini API key
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cascade Progress Tracker */}
            <CascadeTracker
              cascadeLog={cascadeLog}
              activeTier={activeTier}
              isAnalyzing={isAnalyzing}
            />

            {/* Place Card */}
            {placeResult && (
              <PlaceResultCard
                place={placeResult}
                detectionSource={placeResult.detectionSource}
                tier={placeResult.tier}
                onSaveWishlist={handleSaveWishlist}
                isSaved={isPlaceInWishlist(placeResult.name)}
              />
            )}
          </div>
        ) : (
          <WishlistView
            wishlist={wishlist}
            onUpdateWishlist={handleUpdateWishlist}
            onDeleteWishlist={handleDeleteWishlist}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={geminiKey}
        onSaveGeminiKey={handleSaveGeminiKey}
        googlePlacesKey={googlePlacesKey}
        onSaveGooglePlacesKey={handleSaveGooglePlacesKey}
      />

      <footer className="border-t border-[rgba(255,255,255,0.08)] py-6 text-center text-xs text-[#A1A1AA] bg-[#121214]">
        <p>
          ReelSpotter &bull; AI Multimodal Reel Place Finder & Wishlist &bull;
          Powered by Google Gemini
        </p>
      </footer>
    </div>
  );
}
