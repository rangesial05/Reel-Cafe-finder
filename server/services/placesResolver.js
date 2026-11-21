/**
 * Resolves place details and generates Google Maps deep links & coordinates
 */

export async function resolvePlace({ placeName, cityOrArea, category }) {
  if (!placeName) return null;

  const query = cityOrArea ? `${placeName}, ${cityOrArea}` : placeName;
  const encodedQuery = encodeURIComponent(query);
  
  // Direct Google Maps Deep Links (opens in app or browser on any device)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;

  let placeDetails = {
    name: placeName,
    category: category || 'Cafe / Restaurant',
    cityOrArea: cityOrArea || 'Unknown Location',
    formattedAddress: cityOrArea ? `${placeName}, ${cityOrArea}` : placeName,
    googleMapsUrl,
    googleMapsDirectionsUrl,
    rating: 4.5,
    userRatingsTotal: null,
    coordinates: null, // [lat, lng]
    photos: [],
    source: 'generated',
  };

  // 1. If Google Places API key is configured, query official Google Places
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (googleApiKey) {
    try {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedQuery}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,photos,types&key=${googleApiKey}`;
      const res = await fetch(placesUrl);
      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        if (candidate) {
          placeDetails.name = candidate.name || placeDetails.name;
          placeDetails.formattedAddress = candidate.formatted_address || placeDetails.formattedAddress;
          placeDetails.rating = candidate.rating || placeDetails.rating;
          placeDetails.userRatingsTotal = candidate.user_ratings_total;
          if (candidate.geometry?.location) {
            placeDetails.coordinates = [candidate.geometry.location.lat, candidate.geometry.location.lng];
          }
          if (candidate.place_id) {
            placeDetails.googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${candidate.place_id}`;
          }
          placeDetails.source = 'google_places_api';
        }
      }
    } catch (err) {
      console.warn('Google Places API query failed, falling back:', err.message);
    }
  }

  // 2. If no coordinates yet, use OpenStreetMap Nominatim for free lat/lng so Wishlist map pins work!
  if (!placeDetails.coordinates) {
    try {
      const geoQuery = cityOrArea ? `${placeName}, ${cityOrArea}` : (cityOrArea || placeName);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geoQuery)}&format=json&limit=1`;
      const geoRes = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'ReelPlaceFinder/1.0 (contact@reelplacefinder.app)' },
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          placeDetails.coordinates = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
          if (!placeDetails.formattedAddress || placeDetails.formattedAddress === placeName) {
            placeDetails.formattedAddress = geoData[0].display_name;
          }
        }
      }
    } catch {
      // ignore geocoding fallback error
    }
  }

  // Fallback default coordinates if geocoding didn't match (e.g. general city center or default)
  if (!placeDetails.coordinates) {
    // City approximations
    const cityLower = (cityOrArea || '').toLowerCase();
    if (cityLower.includes('mumbai') || cityLower.includes('bandra')) {
      placeDetails.coordinates = [19.0596, 72.8295];
    } else if (cityLower.includes('bangalore') || cityLower.includes('bengaluru') || cityLower.includes('indiranagar')) {
      placeDetails.coordinates = [12.9716, 77.5946];
    } else if (cityLower.includes('delhi') || cityLower.includes('cp') || cityLower.includes('connaught')) {
      placeDetails.coordinates = [28.6139, 77.2090];
    } else if (cityLower.includes('kolkata')) {
      placeDetails.coordinates = [22.5726, 88.3639];
    } else if (cityLower.includes('hyderabad')) {
      placeDetails.coordinates = [17.3850, 78.4867];
    } else if (cityLower.includes('pune')) {
      placeDetails.coordinates = [18.5204, 73.8567];
    } else if (cityLower.includes('new york') || cityLower.includes('nyc') || cityLower.includes('manhattan')) {
      placeDetails.coordinates = [40.7128, -74.0060];
    } else if (cityLower.includes('london')) {
      placeDetails.coordinates = [51.5074, -0.1278];
    } else {
      placeDetails.coordinates = [19.0760, 72.8777]; // default center
    }
  }

  return placeDetails;
}
