import React from 'react';
import { MapPin, Film, Bookmark, Settings, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, wishlistCount, openSettings, hasApiKey }) {
  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#121214]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('finder')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#FF5A36] to-[#FF6F4F] flex items-center justify-center shadow-lg shadow-[#FF5A36]/20 group-hover:scale-105 transition-transform duration-150">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-[#F4F4F5] tracking-tight">
                ReelSpotter
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF5A36]/15 text-[#FF5A36] border border-[#FF5A36]/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] -mt-0.5 hidden sm:block">Find cafe & restaurant places from reels</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('finder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all duration-150 ${
              activeTab === 'finder'
                ? 'bg-[#FF5A36]/15 text-[#FF5A36] border border-[#FF5A36]/30 shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1C1C20]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Spot Reel</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-medium transition-all duration-150 relative ${
              activeTab === 'wishlist'
                ? 'bg-[#FF5A36]/15 text-[#FF5A36] border border-[#FF5A36]/30 shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1C1C20]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Wishlist</span>
            {wishlistCount > 0 && (
              <span className="ml-0.5 px-2 py-0.2 rounded-full text-xs font-bold bg-[#FF5A36] text-white tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Settings / API Key */}
          <button
            onClick={openSettings}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-sm font-medium border transition-all duration-150 ${
              hasApiKey
                ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 hover:bg-[#22C55E]/25'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/25'
            }`}
            title="Configure Gemini & Maps API Keys"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">
              {hasApiKey ? 'Gemini Active' : 'Set API Key'}
            </span>
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-[#22C55E] animate-pulse' : 'bg-[#F59E0B]'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
