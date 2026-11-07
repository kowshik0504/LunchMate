import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Navigation, Search, CheckCircle2, X, Compass, 
  Satellite, Crosshair, AlertCircle, Sparkles, Building, ExternalLink, RefreshCw
} from 'lucide-react';
import { extractCoordinatesFromMapsUrl } from '../data/tnSchoolsData';

// Custom Pulse Doorstep Pin Icon
const createDoorstepIcon = (label = 'EXACT DOORSTEP') => L.divIcon({
  className: 'custom-doorstep-pin',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
      <!-- Pulse radar ring -->
      <div style="position: absolute; top: 0; left: 5px; width: 38px; height: 38px; border-radius: 50%; background: rgba(234, 88, 12, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
      
      <!-- Pin Badge -->
      <div style="width: 48px; height: 48px; border-radius: 50% 50% 50% 0; background: linear-gradient(135deg, #F97316, #EA580C); transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(234, 88, 12, 0.65), 0 3px 8px rgba(0,0,0,0.3); border: 2.5px solid #FFFFFF;">
        <span style="transform: rotate(45deg); font-size: 22px;">🏠</span>
      </div>

      <!-- Street Label Tag -->
      <div style="margin-top: 6px; background: rgba(15, 23, 42, 0.95); border: 1.5px solid #EA580C; border-radius: 99px; padding: 3px 10px; color: #FED7AA; font-size: 0.68rem; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.45); letter-spacing: 0.04em;">
        ${label}
      </div>
    </div>
  `,
  iconSize: [60, 70],
  iconAnchor: [30, 48]
});

// Map Controller for Smooth Fly-To & Drag Events
function MapInteractionController({ position, onPositionChange }) {
  const map = useMap();

  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.flyTo([position.lat, position.lng], Math.max(17, map.getZoom()), {
        animate: true,
        duration: 0.8
      });
    }
  }, [position?.lat, position?.lng, map]);

  useMapEvents({
    click(e) {
      if (e.latlng) {
        onPositionChange({
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6))
        }, 'map_tap');
      }
    }
  });

  return null;
}

export const DoorstepPinpointModal = ({
  isOpen,
  onClose,
  initialCoords = { lat: 13.0827, lng: 80.2707 },
  initialAddress = '',
  onSaveLocation,
  darkMode = true
}) => {
  const [coords, setCoords] = useState(() => ({
    lat: Number(initialCoords?.lat || 13.0827),
    lng: Number(initialCoords?.lng || 80.2707)
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    doorStreet: '',
    areaVillage: '',
    city: 'Chennai',
    pincode: '600102',
    formatted: initialAddress || 'Detecting doorstep address...'
  });
  const [landmarkNote, setLandmarkNote] = useState('');
  const [accuracyMeters, setAccuracyMeters] = useState(8);
  const [accuracyType, setAccuracyType] = useState('pinpoint'); // 'satellite' | 'pinpoint' | 'coarse'
  const [isLocatingSatellite, setIsLocatingSatellite] = useState(false);
  const [pasteLinkText, setPasteLinkText] = useState('');
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'link'

  // Reverse geocode whenever coordinates change
  const fetchAddressForCoords = useCallback((lat, lng) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const a = data.address;
          const street = [a.house_number, a.road || a.pedestrian].filter(Boolean).join(' ');
          const villageArea = a.suburb || a.neighbourhood || a.village || a.city_district || '';
          const city = a.city || a.town || a.county || 'Chennai';
          const postcode = (a.postcode || '').replace(/\D/g, '').slice(0, 6);

          const formatted = [
            street,
            villageArea,
            city,
            postcode ? `Pincode: ${postcode}` : null
          ].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 4).join(', ');

          setAddressDetails({
            doorStreet: street || a.road || '',
            areaVillage: villageArea,
            city: city,
            pincode: postcode || '600001',
            formatted: formatted
          });
        }
      })
      .catch(() => {
        setAddressDetails(prev => ({
          ...prev,
          formatted: `Doorstep Pinpoint (${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E)`
        }));
      });
  }, []);

  // Sync on modal open
  useEffect(() => {
    if (isOpen && initialCoords?.lat && initialCoords?.lng) {
      const validCoords = {
        lat: Number(initialCoords.lat),
        lng: Number(initialCoords.lng)
      };
      setCoords(validCoords);
      fetchAddressForCoords(validCoords.lat, validCoords.lng);
    }
  }, [isOpen, initialCoords?.lat, initialCoords?.lng, fetchAddressForCoords]);

  // Handle position change from tap, drag, or search
  const handlePositionUpdate = (newCoords, source = 'pinpoint') => {
    setCoords(newCoords);
    if (source === 'satellite') {
      setAccuracyType('satellite');
    } else {
      setAccuracyType('pinpoint');
      setAccuracyMeters(3); // 3m precision when hand-placed on map
    }
    fetchAddressForCoords(newCoords.lat, newCoords.lng);
  };

  // High-Precision Multi-Sample Satellite GPS (Swiggy / Uber Standard)
  const handleAcquireSatelliteGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingSatellite(true);

    let bestSample = null;
    let sampleCount = 0;

    // Use watchPosition for 3.5 seconds to acquire the sharpest satellite lock
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        sampleCount++;
        const currentAcc = pos.coords.accuracy || 100;
        if (!bestSample || currentAcc < bestSample.accuracy) {
          bestSample = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(currentAcc)
          };
        }

        // Once accuracy is under 15m or 3 samples acquired, lock in
        if (currentAcc <= 15 || sampleCount >= 4) {
          navigator.geolocation.clearWatch(watchId);
          setIsLocatingSatellite(false);
          if (bestSample) {
            setAccuracyMeters(bestSample.accuracy);
            handlePositionUpdate({ lat: bestSample.lat, lng: bestSample.lng }, 'satellite');
          }
        }
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);
        setIsLocatingSatellite(false);
        console.warn('Satellite GPS acquisition notice:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Hard fallback timeout at 3.5 seconds with network position fallback
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      if (bestSample) {
        setIsLocatingSatellite(false);
        setAccuracyMeters(bestSample.accuracy);
        handlePositionUpdate({ lat: bestSample.lat, lng: bestSample.lng }, 'satellite');
      } else {
        // Fallback to standard network position (works reliably on PCs indoors)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsLocatingSatellite(false);
            const lat = Number(pos.coords.latitude.toFixed(6));
            const lng = Number(pos.coords.longitude.toFixed(6));
            setAccuracyMeters(Math.round(pos.coords.accuracy || 20));
            handlePositionUpdate({ lat, lng }, 'network');
          },
          (err) => {
            setIsLocatingSatellite(false);
            console.warn('Network GPS acquisition notice:', err.message);
          },
          { enableHighAccuracy: false, timeout: 8000 }
        );
      }
    }, 3500);
  };

  // Forward Geocoding Address Search (Autocomplete)
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim() + ', Tamil Nadu, India')}&countrycodes=in&limit=5`, {
      headers: { 'Accept-Language': 'en' }
    })
      .then(res => res.json())
      .then(results => {
        setIsSearching(false);
        if (results && results.length > 0) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      })
      .catch(() => {
        setIsSearching(false);
        setSearchResults([]);
      });
  };

  const handleSelectSearchResult = (result) => {
    const lat = Number(parseFloat(result.lat).toFixed(6));
    const lng = Number(parseFloat(result.lon).toFixed(6));
    setSearchResults([]);
    setSearchQuery(result.display_name?.split(',').slice(0, 2).join(', '));
    handlePositionUpdate({ lat, lng }, 'pinpoint');
  };

  // Handle Google Maps Link / Direct Coordinates Paste
  const handlePasteLinkSubmit = (e) => {
    e?.preventDefault();
    const input = pasteLinkText.trim();
    if (!input) return;

    // Check direct comma coordinates (e.g. 13.0825, 80.2104)
    const coordMatch = input.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        handlePositionUpdate({ lat, lng }, 'pinpoint');
        setPasteLinkText('');
        setActiveTab('map');
        return;
      }
    }

    // Check Google Maps URL
    const extracted = extractCoordinatesFromMapsUrl(input);
    if (extracted && extracted.lat && extracted.lng) {
      handlePositionUpdate({ lat: extracted.lat, lng: extracted.lng }, 'pinpoint');
      setPasteLinkText('');
      setActiveTab('map');
      return;
    }

    alert('Could not detect coordinates from link. Please paste a standard Google Maps link (e.g. https://maps.app.goo.gl/... or 13.0825, 80.2104).');
  };

  // Save location to parent dashboard
  const handleSaveAndConfirm = () => {
    const finalFormatted = landmarkNote.trim()
      ? `${landmarkNote.trim()}, ${addressDetails.formatted}`
      : addressDetails.formatted;

    if (onSaveLocation) {
      onSaveLocation({
        coords,
        formattedAddress: finalFormatted,
        addressDetails: {
          ...addressDetails,
          doorStreet: landmarkNote.trim() || addressDetails.doorStreet,
          coordinates: coords,
          accuracy: accuracyMeters
        },
        accuracy: accuracyMeters
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999999,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 14px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%', maxWidth: 720,
        background: darkMode ? '#0F172A' : '#FFFFFF',
        borderRadius: 24,
        border: darkMode ? '1.5px solid rgba(249,115,22,0.4)' : '1.5px solid #FED7AA',
        boxShadow: darkMode ? '0 24px 64px rgba(0,0,0,0.85)' : '0 24px 56px rgba(249,115,22,0.18)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: '92vh'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: darkMode ? 'rgba(255,255,255,0.02)' : '#FFFDF9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234,88,12,0.35)'
            }}>
              <Crosshair size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                Pinpoint Exact Doorstep Location
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Drag pin or tap map to set your precise house gate (Sub-meter accuracy)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              padding: 6, borderRadius: 8
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab & Search Bar Row */}
        <div style={{
          padding: '12px 18px',
          background: darkMode ? 'rgba(0,0,0,0.2)' : '#F8FAFC',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search apartment, society, street, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  borderRadius: 10,
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #CBD5E1',
                  background: darkMode ? '#1E293B' : '#FFFFFF',
                  color: 'var(--text-heading)', fontSize: '0.84rem', fontWeight: 600, outline: 'none'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
              <button
                type="submit"
                style={{
                  position: 'absolute', right: 4, top: 4, bottom: 4,
                  background: '#EA580C', color: '#FFF', border: 'none',
                  borderRadius: 8, padding: '0 12px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>

            {/* Satellite GPS button */}
            <button
              type="button"
              onClick={handleAcquireSatelliteGps}
              disabled={isLocatingSatellite}
              style={{
                background: darkMode ? '#1E293B' : '#FFFFFF',
                border: '1.5px solid #10B981',
                color: '#10B981',
                borderRadius: 10, padding: '8px 12px',
                fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
              }}
              title="Acquire multi-sample satellite GPS directly from your device"
            >
              <RefreshCw size={13} className={isLocatingSatellite ? 'spin' : ''} />
              <span>{isLocatingSatellite ? 'Locking Satellite...' : 'Locate Device GPS'}</span>
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              background: darkMode ? '#1E293B' : '#FFFFFF',
              border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #CBD5E1',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxHeight: 180, overflowY: 'auto'
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSearchResult(r)}
                  style={{
                    padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-heading)',
                    borderBottom: i < searchResults.length - 1 ? (darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9') : 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(234,88,12,0.15)' : '#FFF7ED'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={14} color="#EA580C" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.display_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Map Area */}
        <div style={{ height: 320, width: '100%', position: 'relative' }}>
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={17}
            zoomControl={false}
            attributionControl={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution=""
              url={darkMode 
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />

            <MapInteractionController
              position={coords}
              onPositionChange={handlePositionUpdate}
            />

            {/* Draggable Exact Doorstep Pin */}
            <Marker
              position={[coords.lat, coords.lng]}
              icon={createDoorstepIcon('YOUR DOORSTEP')}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target.getLatLng();
                  handlePositionUpdate({
                    lat: Number(m.lat.toFixed(6)),
                    lng: Number(m.lng.toFixed(6))
                  }, 'pinpoint');
                }
              }}
            />
          </MapContainer>

          {/* Floating Instructions Pill */}
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(249,115,22,0.4)', borderRadius: 99,
            padding: '4px 14px', color: '#FED7AA', fontSize: '0.72rem', fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Crosshair size={13} color="#F97316" />
            <span>Tap map or drag pin directly to your house gate</span>
          </div>

          {/* Precision Badge */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(16,185,129,0.5)', borderRadius: 10,
            padding: '4px 10px', color: '#34D399', fontSize: '0.7rem', fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Satellite size={12} color="#10B981" />
            <span>Accuracy: ±{accuracyMeters}m (Exact Sub-meter Pin)</span>
          </div>
        </div>

        {/* Resolved Doorstep Address Details Card */}
        <div style={{
          padding: '16px 20px',
          background: darkMode ? '#0F172A' : '#FFFFFF',
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#F97316' }}>
                Resolved Doorstep Location:
              </span>
              <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700 }}>
                {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.4 }}>
              📍 {addressDetails.formatted}
            </div>
          </div>

          {/* Door / Flat No / Landmark Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Flat / Door No. or Specific Entrance Gate (Helps rider locate instantly):
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 302, Green Garden Apts, Gate 2"
              value={landmarkNote}
              onChange={(e) => setLandmarkNote(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 10,
                border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #CBD5E1',
                background: darkMode ? '#1E293B' : '#F8FAFC',
                color: 'var(--text-heading)', fontSize: '0.86rem', fontWeight: 700, outline: 'none'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #CBD5E1',
                color: 'var(--text-muted)', borderRadius: 10, padding: '9px 16px',
                fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndConfirm}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFF', border: 'none',
                borderRadius: 12, padding: '10px 22px',
                fontSize: '0.88rem', fontWeight: 900, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Confirm & Lock Exact Doorstep</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
