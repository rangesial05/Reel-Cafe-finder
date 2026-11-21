import React, { useState } from 'react';
import { MapPin, ExternalLink, Bookmark, Check, Star, Navigation, Sparkles, Coffee, UtensilsCrossed, Cake, Beer, Compass } from 'lucide-react';

export default function PlaceResultCard({
  place,
  detectionSource,
  tier,
  onSaveWishlist,
  isSaved,
}) {
  if (!place) return null;

  const [notes, setNotes] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('cafe') || cat.includes('coffee')) return <Coffee className="w-4 h-4" />;
    if (cat.includes('bakery') || cat.includes('bake')) return <Cake className="w-4 h-4" />;
    if (cat.includes('bar') || cat.includes('pub')) return <Beer className="w-4 h-4" />;
    return <UtensilsCrossed className="w-4 h-4" />;
  };

  const getSourceBadge = () => {
    if (detectionSource === 'video' || tier === 1) {
      return {
        label: 'Detected from Video & Audio',
        color: 'bg-[#FF5A36]/15 text-[#FF5A36] border-[#FF5A36]/30',
        icon: '🎥',
      };
    }
    if (detectionSource === 'caption' || tier === 2) {
      return {
        label: 'Extracted from Caption & Tags',
        color: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
        icon: '📝',
      };
    }
    return {
      label: 'Identified from Comments Q&A',
      color: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
      icon: '💬',
    };
  };

  const badge = getSourceBadge();

  const handleSave = () => {
    onSaveWishlist({
      ...place,
      notes: notes.trim(),
      detectionSource: detectionSource || (tier === 1 ? 'video' : tier === 2 ? 'caption' : 'comments'),
    });
  };

  return (
    <div className="max-w-3xl mx-auto mb-10 animate-fadeIn">
      <div className="relative rounded-[24px] bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br from-[#FF5A36]/15 to-[#FF6F4F]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>

            {place.confidence && (
              <span className="text-xs font-semibold text-[#22C55E] bg-[#22C55E]/15 px-2.5 py-1 rounded-full border border-[#22C55E]/30 tabular-nums">
                {Math.round(place.confidence * 100)}% match confidence
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span>{place.rating || 4.5}</span>
            {place.userRatingsTotal && (
              <span className="text-[#A1A1AA] font-normal">({place.userRatingsTotal} reviews)</span>
            )}
          </div>
        </div>

        {/* Venue Title & Category */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[#FF5A36] text-xs font-bold uppercase tracking-wider mb-1">
            {getCategoryIcon(place.category)}
            <span>{place.category || 'Cafe / Restaurant'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] tracking-tight">
            {place.name}
          </h2>
          <div className="flex items-start gap-2 text-[#A1A1AA] text-sm mt-2">
            <MapPin className="w-4 h-4 text-[#FF5A36] mt-0.5 shrink-0" />
            <span>{place.formattedAddress || place.cityOrArea}</span>
          </div>
        </div>

        {/* Evidence Quote / Clue */}
        {place.evidence && (
          <div className="p-3.5 rounded-[16px] bg-[#242429] border border-[rgba(255,255,255,0.08)] mb-6 text-xs">
            <span className="font-bold text-[#A1A1AA] uppercase tracking-wider text-[10px] block mb-1">
              AI Detection Clue:
            </span>
            <p className="text-[#F4F4F5] italic leading-relaxed">
              "{place.evidence}"
            </p>
          </div>
        )}

        {/* Personal Note Input Toggle */}
        <div className="mb-6">
          {!showNoteInput ? (
            <button
              onClick={() => setShowNoteInput(true)}
              className="text-xs text-[#FF5A36] hover:text-[#FF6F4F] font-semibold transition-colors duration-150"
            >
              + Add a personal note (e.g. "Try the tiramisu and cold brew")
            </button>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">Personal Note / Recommendation:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Best outdoor seating, order the cinnamon bun..."
                className="w-full text-xs p-2.5 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-[rgba(255,255,255,0.08)]">
          {/* Open Google Maps Button (Direct Link) */}
          <a
            href={place.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-5 py-3 rounded-[12px] bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold text-sm shadow-lg shadow-[#22C55E]/20 flex items-center justify-center gap-2 transition duration-150"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80" />
          </a>

          {/* Directions Button */}
          {place.googleMapsDirectionsUrl && (
            <a
              href={place.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-[12px] bg-[#242429] hover:bg-[#2d2d34] text-[#F4F4F5] font-semibold text-sm border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] flex items-center justify-center gap-2 transition duration-150"
              title="Get Driving / Transit Directions"
            >
              <Navigation className="w-4 h-4 text-[#22C55E]" />
              <span className="hidden sm:inline">Directions</span>
            </a>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleSave}
            className={`px-5 py-3 rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 transition duration-150 ${
              isSaved
                ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 hover:bg-[#22C55E]/25'
                : 'bg-[#FF5A36] hover:bg-[#FF6F4F] text-white shadow-lg shadow-[#FF5A36]/25'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>Saved in Wishlist</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Add to Wishlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
