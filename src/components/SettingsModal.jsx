import React, { useState } from 'react';
import { X, Key, Check, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  geminiKey,
  onSaveGeminiKey,
  googlePlacesKey,
  onSaveGooglePlacesKey,
}) {
  if (!isOpen) return null;

  const [inputGemini, setInputGemini] = useState(geminiKey || '');
  const [inputPlaces, setInputPlaces] = useState(googlePlacesKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveGeminiKey(inputGemini.trim());
    onSaveGooglePlacesKey(inputPlaces.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-[24px] bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-[12px] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#242429] transition-all duration-150"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-[12px] bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center border border-[#FF5A36]/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F4F4F5]">API Configuration</h3>
            <p className="text-xs text-[#A1A1AA]">Power your 3-Tier Multimodal Reel Detector</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#F4F4F5] flex items-center gap-1.5">
                <span>Google Gemini API Key</span>
                <span className="text-[#FF5A36] font-bold">*</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#FF5A36] hover:text-[#FF6F4F] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={inputGemini}
              onChange={(e) => setInputGemini(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono p-3 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
            />
            <p className="text-[11px] text-[#A1A1AA] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Used directly for Gemini 2.0 Flash video, caption & comment reasoning.</span>
            </p>
          </div>

          {/* Google Places Key (Optional) */}
          <div className="pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#F4F4F5] flex items-center gap-1.5">
                <span>Google Maps / Places API Key</span>
                <span className="text-[10px] text-[#A1A1AA] font-normal uppercase">(Optional)</span>
              </label>
            </div>
            <input
              type="password"
              value={inputPlaces}
              onChange={(e) => setInputPlaces(e.target.value)}
              placeholder="Leave blank for automatic zero-cost Google Maps search links"
              className="w-full text-xs font-mono p-3 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
            />
            <p className="text-[11px] text-[#A1A1AA] mt-1">
              If omitted, the app automatically generates direct Google Maps deep search links at zero cost!
            </p>
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#242429] transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[12px] bg-[#FF5A36] hover:bg-[#FF6F4F] text-white text-xs font-bold shadow-lg shadow-[#FF5A36]/25 transition-all duration-150 flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save API Keys</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
