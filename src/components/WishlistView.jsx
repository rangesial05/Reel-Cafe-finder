import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ExternalLink, Trash2, CheckCircle2, Circle, Star, Coffee, UtensilsCrossed, Cake, Beer, Search, Filter, Compass, Map as MapIcon, Grid } from 'lucide-react';
import L from 'leaflet';

export default function WishlistView({
  wishlist,
  onUpdateWishlist,
  onDeleteWishlist,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'visited' | 'pending'
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Filtered places
  const filteredList = wishlist.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.cityOrArea && item.cityOrArea.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' ||
      (item.category && item.category.toLowerCase().includes(categoryFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'visited' && item.visited) ||
      (statusFilter === 'pending' && !item.visited);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const visitedCount = wishlist.filter((x) => x.visited).length;
  const pendingCount = wishlist.length - visitedCount;

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: India or first place coords
      const defaultCenter = filteredList[0]?.coordinates || [19.0760, 72.8777];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
      });

      // CartoDB Dark Matter tiles for sleek dark UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = [];

    filteredList.forEach((place) => {
      if (place.coordinates && Array.isArray(place.coordinates)) {
        const [lat, lng] = place.coordinates;
        bounds.push([lat, lng]);

        // Custom HTML marker pin
        const pinHtml = `
          <div style="background: ${place.visited ? '#22C55E' : '#FF5A36'}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid white; cursor: pointer; font-weight: bold; font-size: 14px;">
            ${place.category?.toLowerCase().includes('cafe') ? '☕' : '🍽️'}
          </div>
        `;

        const customIcon = L.divIcon({
          html: pinHtml,
          className: '',
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -32],
        });

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', Inter, sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; color: #121214; margin-bottom: 2px;">${place.name}</div>
            <div style="font-size: 11px; color: #52525b; margin-bottom: 6px;">${place.formattedAddress || place.cityOrArea}</div>
            <div style="font-size: 11px; font-weight: 600; color: #d97706; margin-bottom: 8px;">★ ${place.rating || 4.5} ${place.visited ? '• <span style=\"color:#22C55E; font-weight:bold;\">Visited</span>' : ''}</div>
            <a href="${place.googleMapsUrl}" target="_blank" style="display: block; text-align: center; background: #22C55E; color: white; padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none;">Open Google Maps</a>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      // Don't destroy on every re-render, keep instance
    };
  }, [viewMode, filteredList]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#F4F4F5] flex items-center gap-2">
            <span>Saved Food & Cafe Spots</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-[#FF5A36]/15 text-[#FF5A36] border border-[#FF5A36]/30 tabular-nums">
              {wishlist.length} places
            </span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1 tabular-nums">
            {visitedCount} visited &bull; {pendingCount} want to visit
          </p>
        </div>

        {/* View Switcher: Grid vs Map */}
        <div className="flex items-center p-1 rounded-[12px] bg-[#1C1C20] border border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-150 ${
              viewMode === 'grid'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid Cards</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-150 ${
              viewMode === 'map'
                ? 'bg-[#FF5A36] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cafe or city..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36]/40 transition duration-150"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-full bg-[#242429] border border-[rgba(255,255,255,0.08)] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full transition-all duration-150 ${statusFilter === 'all' ? 'bg-[#FF5A36] text-white font-semibold' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-full transition-all duration-150 ${statusFilter === 'pending' ? 'bg-[#FF5A36] text-white font-semibold' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'}`}
            >
              Want to Visit
            </button>
            <button
              onClick={() => setStatusFilter('visited')}
              className={`px-3 py-1 rounded-full transition-all duration-150 ${statusFilter === 'visited' ? 'bg-[#22C55E] text-white font-semibold' : 'text-[#A1A1AA] hover:text-[#F4F4F5]'}`}
            >
              Visited
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-[12px] bg-[#242429] border border-[rgba(255,255,255,0.08)] text-[#F4F4F5] focus:outline-none focus:border-[#FF5A36] transition duration-150"
          >
            <option value="all" className="bg-[#242429] text-[#F4F4F5]">All Categories</option>
            <option value="cafe" className="bg-[#242429] text-[#F4F4F5]">Cafes & Coffee</option>
            <option value="bakery" className="bg-[#242429] text-[#F4F4F5]">Bakeries</option>
            <option value="restaurant" className="bg-[#242429] text-[#F4F4F5]">Restaurants</option>
            <option value="bar" className="bg-[#242429] text-[#F4F4F5]">Bars & Nightlife</option>
          </select>
        </div>
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-2xl relative h-[550px] bg-[#121214]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-[#1C1C20] border border-[rgba(255,255,255,0.08)] rounded-[24px]">
          <div className="w-12 h-12 rounded-[16px] bg-[#242429] text-[#A1A1AA] flex items-center justify-center mx-auto mb-3 border border-[rgba(255,255,255,0.06)]">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F4F4F5]">No places match your filter</h3>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, or paste a reel link in the Spot Reel tab to add new places!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] bg-[#1C1C20] hover:shadow-xl transition-all duration-200 p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] uppercase tracking-wider">
                    {item.category?.toLowerCase().includes('cafe') ? (
                      <Coffee className="w-3.5 h-3.5" />
                    ) : (
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    )}
                    <span>{item.category || 'Spot'}</span>
                  </div>

                  {/* Visited Checkbox */}
                  <button
                    onClick={() => onUpdateWishlist(item.id, { visited: !item.visited })}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all duration-150 ${
                      item.visited
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                        : 'bg-[#242429] text-[#A1A1AA] border-[rgba(255,255,255,0.08)] hover:text-[#F4F4F5]'
                    }`}
                  >
                    {item.visited ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                        <span>Visited</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 text-[#A1A1AA]" />
                        <span>To Visit</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-[#F4F4F5] group-hover:text-[#FF5A36] transition-colors duration-150">
                  {item.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A36] shrink-0" />
                  <span className="truncate">{item.cityOrArea || item.formattedAddress}</span>
                </div>

                {item.notes && (
                  <p className="mt-3 text-xs text-[#F4F4F5] bg-[#242429] p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.08)] italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2">
                <a
                  href={item.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E] hover:text-[#16a34a] transition-colors duration-150"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Open Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#22C55E]" />
                </a>

                <button
                  onClick={() => onDeleteWishlist(item.id)}
                  title="Remove from wishlist"
                  className="p-1.5 text-[#A1A1AA] hover:text-[#FF5A36] rounded-[8px] hover:bg-[#242429] transition-colors duration-150"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
