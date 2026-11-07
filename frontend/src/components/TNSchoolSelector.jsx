import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TN_DISTRICTS_2026, 
  TN_SCHOOLS_BY_DISTRICT,
  getSchoolsForDistrict, 
  getAreasForDistrict,
  lookupTnSchoolCoordinates, 
  extractCoordinatesFromMapsUrl,
  getAllSchoolsCount 
} from '../data/tnSchoolsData';
import { 
  Search, School, MapPin, CheckCircle2, Info, X, ExternalLink, 
  Compass, ChevronDown, ChevronUp, Sparkles, Building2, Check, ArrowRight
} from 'lucide-react';

export const TNSchoolSelector = ({
  selectedDistrict = 'Chennai',
  onDistrictChange,
  selectedSchool = '',
  selectedSchoolMapsLink = '',
  onSchoolChange,
  darkMode = true,
  showNote = true,
  disabled = false,
}) => {
  const [district, setDistrict] = useState(selectedDistrict || 'Chennai');
  const [schools, setSchools] = useState(() => getSchoolsForDistrict(selectedDistrict || 'Chennai'));
  const [activeBoardFilter, setActiveBoardFilter] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [searchQuery, setSearchQuery] = useState(selectedSchool && selectedSchool !== '__CUSTOM__' ? selectedSchool : '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomSchool, setIsCustomSchool] = useState(selectedSchool === '__CUSTOM__');
  const [isUserCustomChoice, setIsUserCustomChoice] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [customBoard, setCustomBoard] = useState('Government School');
  const [customMapsLink, setCustomMapsLink] = useState(selectedSchoolMapsLink || '');
  const [detectedCoords, setDetectedCoords] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Available unique areas in currently selected district
  const availableAreas = useMemo(() => {
    return getAreasForDistrict(district);
  }, [district]);

  // Sync when selectedDistrict prop changes from parent
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== district) {
      setDistrict(selectedDistrict);
      const newSchools = getSchoolsForDistrict(selectedDistrict);
      setSchools(newSchools);
      setActiveBoardFilter('All');
      setSelectedArea('All Areas');

      const exists = newSchools.some(s => s.name === selectedSchool);
      if (!exists && !isUserCustomChoice) {
        setIsCustomSchool(false);
        setSearchQuery('');
        if (onSchoolChange && selectedSchool) {
          onSchoolChange('', null, '');
        }
      }
    }
  }, [selectedDistrict]);

  // Keep search query and custom status in sync when selectedSchool prop updates
  useEffect(() => {
    // If the user has explicitly chosen custom school mode, never auto-close it when typing
    if (isCustomSchool || isUserCustomChoice) {
      if (selectedSchool && selectedSchool !== '__CUSTOM__') {
        setCustomSchoolName(selectedSchool);
      }
      return;
    }
    if (selectedSchool) {
      if (selectedSchool === '__CUSTOM__') {
        setIsCustomSchool(true);
        setIsUserCustomChoice(true);
      } else {
        setIsCustomSchool(false);
        setSearchQuery(selectedSchool);
      }
    } else {
      setIsCustomSchool(false);
      setSearchQuery('');
    }
  }, [selectedSchool, isCustomSchool, isUserCustomChoice]);

  // Sync approved schools dynamically across browser events
  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (!e || e.key === 'lm-approved-schools' || !e.key) {
        setSchools(getSchoolsForDistrict(district));
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [district]);

  // Sync maps link if passed from parent
  useEffect(() => {
    if (selectedSchoolMapsLink && selectedSchoolMapsLink !== customMapsLink) {
      setCustomMapsLink(selectedSchoolMapsLink);
      const parsed = extractCoordinatesFromMapsUrl(selectedSchoolMapsLink);
      if (parsed) setDetectedCoords(parsed);
    }
  }, [selectedSchoolMapsLink]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        // If user left without selecting, restore selected school or best match
        if (selectedSchool && selectedSchool !== '__CUSTOM__') {
          setSearchQuery(selectedSchool);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedSchool]);

  const handleDistrictSelect = (e) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    setActiveBoardFilter('All');
    setSelectedArea('All Areas');
    if (onDistrictChange) onDistrictChange(newDist);

    const newSchools = getSchoolsForDistrict(newDist);
    setSchools(newSchools);

    if (!isUserCustomChoice) {
      setIsCustomSchool(false);
      setSearchQuery('');
      if (onSchoolChange) {
        onSchoolChange('', null, '');
      }
    }
  };

  const selectSchoolItem = (schoolObj) => {
    setIsCustomSchool(false);
    setIsUserCustomChoice(false);
    setSearchQuery(schoolObj.name);
    setIsDropdownOpen(false);

    const coords = { lat: schoolObj.lat, lng: schoolObj.lng };
    const mapsLink = schoolObj.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(schoolObj.name + ', ' + (schoolObj.area ? schoolObj.area + ', ' : '') + district + ', Tamil Nadu')}`;
    
    if (onSchoolChange) {
      onSchoolChange(schoolObj.name, coords, mapsLink);
    }
  };

  const selectOtherDistrictSchool = (schoolObj, otherDistrict) => {
    setDistrict(otherDistrict);
    setSelectedArea('All Areas');
    if (onDistrictChange) onDistrictChange(otherDistrict);
    const newSchools = getSchoolsForDistrict(otherDistrict);
    setSchools(newSchools);
    selectSchoolItem(schoolObj);
  };

  const handleCustomSchoolInput = (e) => {
    const val = e.target.value;
    setCustomSchoolName(val);
    setIsUserCustomChoice(true);
    setIsCustomSchool(true);
    const coords = lookupTnSchoolCoordinates(val, district, customMapsLink);
    if (onSchoolChange) {
      onSchoolChange(val, coords, customMapsLink);
    }
  };

  const handleMapsLinkChange = (e) => {
    const link = e.target.value;
    setCustomMapsLink(link);
    setIsUserCustomChoice(true);
    setIsCustomSchool(true);
    const extracted = extractCoordinatesFromMapsUrl(link);
    setDetectedCoords(extracted);
    const coords = lookupTnSchoolCoordinates(customSchoolName || 'Custom School', district, link);
    if (onSchoolChange) {
      onSchoolChange(customSchoolName, coords, link);
    }
  };

  const handleStartCustomSchool = (initialName = '') => {
    setIsCustomSchool(true);
    setIsUserCustomChoice(true);
    setIsDropdownOpen(false);
    const name = initialName || searchQuery || '';
    setCustomSchoolName(name);
    if (onSchoolChange) {
      const coords = lookupTnSchoolCoordinates(name, district, customMapsLink);
      onSchoolChange(name, coords, customMapsLink);
    }
  };

  // Filtered schools for the current district based on active board filter, selected area and typed query
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      // Area filter
      if (selectedArea !== 'All Areas' && s.area !== selectedArea) {
        return false;
      }

      // Board category filter
      if (activeBoardFilter !== 'All') {
        if (activeBoardFilter === 'Government' && s.board !== 'Government School') return false;
        if (activeBoardFilter === 'Matriculation' && s.board !== 'Matriculation') return false;
        if (activeBoardFilter === 'State Board' && s.board !== 'State Board') return false;
        if (activeBoardFilter === 'CBSE' && !['CBSE', 'ICSE', 'IB / ICSE', 'IGCSE'].includes(s.board)) return false;
        if (activeBoardFilter === 'Anglo-Indian' && s.board !== 'Anglo-Indian') return false;
      }

      // Search text query: searches by school name, area or board
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesArea = s.area && s.area.toLowerCase().includes(q);
        const matchesBoard = s.board && s.board.toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesBoard) return false;
      }

      return true;
    });
  }, [schools, selectedArea, activeBoardFilter, searchQuery]);

  // Search across other districts if query is at least 3 chars and not found in current district
  const otherDistrictMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 3 || filteredSchools.length > 4) return [];

    const matches = [];
    for (const [distName, distSchools] of Object.entries(TN_SCHOOLS_BY_DISTRICT)) {
      if (distName === district) continue;
      for (const s of distSchools) {
        if (s.name.toLowerCase().includes(q) || (s.area && s.area.toLowerCase().includes(q))) {
          matches.push({ ...s, district: distName });
          if (matches.length >= 4) return matches;
        }
      }
    }
    return matches;
  }, [searchQuery, district, filteredSchools.length]);

  // Board counts for pills in the current district
  const counts = useMemo(() => {
    const c = { All: schools.length, Government: 0, Matriculation: 0, 'State Board': 0, CBSE: 0 };
    schools.forEach(s => {
      if (s.board === 'Government School') c.Government++;
      else if (s.board === 'Matriculation') c.Matriculation++;
      else if (s.board === 'State Board') c['State Board']++;
      else if (['CBSE', 'ICSE', 'IB / ICSE', 'IGCSE'].includes(s.board)) c.CBSE++;
    });
    return c;
  }, [schools]);

  // Helper for board badge styling
  const getBoardBadgeStyle = (board) => {
    switch (board) {
      case 'Government School':
        return { bg: 'rgba(16, 185, 129, 0.16)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)' };
      case 'Matriculation':
        return { bg: 'rgba(168, 85, 247, 0.16)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.4)' };
      case 'State Board':
        return { bg: 'rgba(14, 165, 233, 0.16)', color: '#38BDF8', border: '1px solid rgba(14, 165, 233, 0.4)' };
      case 'CBSE':
      case 'ICSE':
        return { bg: 'rgba(245, 158, 11, 0.16)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.4)' };
      case 'Anglo-Indian':
        return { bg: 'rgba(244, 63, 94, 0.16)', color: '#FB7185', border: '1px solid rgba(244, 63, 94, 0.4)' };
      default:
        return { bg: 'rgba(249, 115, 22, 0.16)', color: '#F97316', border: '1px solid rgba(249, 115, 22, 0.4)' };
    }
  };

  const selectedSchoolObj = useMemo(() => {
    return schools.find(s => s.name === selectedSchool);
  }, [schools, selectedSchool]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 2026 Admin Note */}
      {showNote && (
        <div style={{
          background: darkMode ? 'rgba(249, 115, 22, 0.09)' : '#FFF7ED',
          border: '1.5px solid rgba(249, 115, 22, 0.35)',
          borderRadius: 10,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.74rem',
          color: darkMode ? '#FEBA74' : '#C2410C',
          fontWeight: 700,
        }}>
          <Info size={15} style={{ flexShrink: 0, color: '#F97316' }} />
          <span>
            <strong>Note:</strong> Select the <strong>District</strong>, then simply type or pick your school name. Contains all verified <strong>Government, Matriculation, State Board & CBSE</strong> campuses across Tamil Nadu.
          </span>
        </div>
      )}

      {/* District & School Searchable Combobox Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 10 }}>
        
        {/* 1. District Selector */}
        <div>
          <label style={{
            display: 'block',
            color: darkMode ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 6,
            height: 18,
            whiteSpace: 'nowrap',
          }}>
            District (2026 TN) *
          </label>
          <select
            value={district}
            onChange={handleDistrictSelect}
            disabled={disabled}
            style={{
              width: '100%',
              height: 42,
              boxSizing: 'border-box',
              background: darkMode ? '#1A120B' : '#FFF',
              border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
              borderRadius: 10,
              padding: '0 10px',
              color: darkMode ? '#FFF' : '#0F172A',
              fontSize: '0.86rem',
              fontWeight: 800,
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {TN_DISTRICTS_2026.map(d => (
              <option key={d} value={d} style={{ background: '#1A120B', color: '#FFF' }}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Interactive Searchable School Combobox */}
        <div ref={containerRef} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, height: 18 }}>
            <label style={{
              color: darkMode ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              School in {district} *
            </label>
            <span style={{
              fontSize: '0.66rem',
              color: '#F97316',
              fontWeight: 800,
              background: darkMode ? 'rgba(249,115,22,0.15)' : '#FFEDD5',
              padding: '1px 6px',
              borderRadius: 6,
              whiteSpace: 'nowrap'
            }}>
              ⭐ {schools.length} Verified
            </span>
          </div>

          {/* Combobox Direct Typing Input */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDropdownOpen ? '#F97316' : (darkMode ? 'rgba(255,255,255,0.5)' : '#64748B'),
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              transition: 'color 0.2s ease',
            }}>
              <Search size={15} />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={isCustomSchool ? (customSchoolName || '➕ Unlisted / Custom School') : searchQuery}
              onChange={(e) => {
                if (isCustomSchool) setIsCustomSchool(false);
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsDropdownOpen(false);
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredSchools.length > 0) {
                    selectSchoolItem(filteredSchools[0]);
                  }
                }
              }}
              placeholder={`Search school or area (e.g. Paranur, SP Kovil, Acharapakkam, DAV)...`}
              disabled={disabled}
              style={{
                width: '100%',
                height: 42,
                boxSizing: 'border-box',
                background: darkMode ? '#1A120B' : '#FFF',
                border: isDropdownOpen
                  ? '1.5px solid #F97316'
                  : (darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1'),
                borderRadius: 10,
                padding: '0 56px 0 32px',
                color: darkMode ? '#FFF' : '#0F172A',
                fontSize: '0.86rem',
                fontWeight: 700,
                outline: 'none',
                boxShadow: isDropdownOpen ? '0 0 0 3px rgba(249,115,22,0.18)' : 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                cursor: disabled ? 'not-allowed' : 'text',
              }}
            />

            {/* Right Action Icons: Clear (X) & Chevron Toggle */}
            <div style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {searchQuery && !disabled && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsCustomSchool(false);
                    if (onSchoolChange) onSchoolChange('', null, '');
                    setIsDropdownOpen(true);
                    inputRef.current?.focus();
                  }}
                  title="Clear school name to re-type"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 3,
                    cursor: 'pointer',
                    color: darkMode ? 'rgba(255,255,255,0.45)' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 4,
                  }}
                >
                  <X size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!disabled) {
                    setIsDropdownOpen(!isDropdownOpen);
                    if (!isDropdownOpen) inputRef.current?.focus();
                  }
                }}
                title={isDropdownOpen ? "Close list" : "Browse all schools"}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 3,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  color: isDropdownOpen ? '#F97316' : (darkMode ? 'rgba(255,255,255,0.6)' : '#64748B'),
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 4,
                }}
              >
                {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* 🌟 CUSTOM IN-CARD FLOATING DROPDOWN MENU (No more clipping or overflowing!) */}
          {isDropdownOpen && !disabled && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 5px)',
              left: 0,
              right: 0,
              zIndex: 9999,
              background: darkMode ? '#140E0A' : '#FFFFFF',
              border: '1.5px solid rgba(249, 115, 22, 0.45)',
              borderRadius: 14,
              boxShadow: darkMode 
                ? '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(249, 115, 22, 0.25)' 
                : '0 16px 40px rgba(0, 0, 0, 0.15)',
              maxHeight: 285,
              overflowY: 'auto',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              
              {/* Category Filter Pills Inside Dropdown */}
              <div style={{
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
                padding: '4px 6px 6px',
                borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                marginBottom: 2,
              }}>
                {[
                  { id: 'All', label: `All (${counts.All})` },
                  { id: 'Government', label: `Govt (${counts.Government})` },
                  { id: 'Matriculation', label: `Matric (${counts.Matriculation})` },
                  { id: 'State Board', label: `State (${counts['State Board']})` },
                  { id: 'CBSE', label: `CBSE (${counts.CBSE})` },
                ].map(b => {
                  const isActive = activeBoardFilter === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setActiveBoardFilter(b.id)}
                      style={{
                        background: isActive ? '#F97316' : (darkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                        color: isActive ? '#FFF' : (darkMode ? '#CBD5E1' : '#475569'),
                        border: isActive ? '1px solid #EA580C' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0'),
                        borderRadius: 12,
                        padding: '2px 7px',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>

              {/* Quick Area / Corridor selector for the district */}
              {availableAreas.length > 2 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px 5px',
                  background: darkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                  borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
                  marginBottom: 3,
                }}>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    color: '#F97316',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    flexShrink: 0,
                  }}>
                    <MapPin size={11} /> Area:
                  </span>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      background: darkMode ? '#1A120B' : '#FFF',
                      color: darkMode ? '#FFF' : '#0F172A',
                      border: darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid #CBD5E1',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    {availableAreas.map(a => (
                      <option key={a} value={a} style={{ background: '#1A120B', color: '#FFF' }}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2px 8px',
                fontSize: '0.66rem',
                color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B',
                fontWeight: 700,
              }}>
                <span>
                  {searchQuery ? `Matching "${searchQuery}" in ${district}` : (selectedArea !== 'All Areas' ? `${selectedArea} (${filteredSchools.length} schools)` : `All Schools in ${district}`)}
                </span>
                <span style={{ color: '#F97316' }}>{filteredSchools.length} available</span>
              </div>

              {/* School Item List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredSchools.map((schoolItem) => {
                  const isSelected = selectedSchool === schoolItem.name && !isCustomSchool;
                  const badge = getBoardBadgeStyle(schoolItem.board);

                  return (
                    <div
                      key={schoolItem.name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSchoolItem(schoolItem);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isSelected 
                          ? (darkMode ? 'rgba(249,115,22,0.22)' : '#FFEDD5')
                          : 'transparent',
                        border: isSelected ? '1px solid rgba(249,115,22,0.45)' : '1px solid transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : '#F8FAFC';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                        <School size={15} style={{ flexShrink: 0, color: isSelected ? '#F97316' : (darkMode ? 'rgba(255,255,255,0.4)' : '#94A3B8') }} />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? '#F97316' : (darkMode ? '#FFF' : '#0F172A'),
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {schoolItem.name}
                          </span>
                          {schoolItem.area && (
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 600,
                              color: isSelected ? (darkMode ? '#FDBA74' : '#C2410C') : (darkMode ? 'rgba(255,255,255,0.5)' : '#64748B'),
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                            }}>
                              <MapPin size={10} color="#F97316" /> {schoolItem.area}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 6,
                          background: badge.bg,
                          color: badge.color,
                          border: badge.border,
                          whiteSpace: 'nowrap',
                        }}>
                          {schoolItem.board}
                        </span>
                        {isSelected && <Check size={14} color="#10B981" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No matches inside district */}
              {filteredSchools.length === 0 && (
                <div style={{
                  padding: '12px 10px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  alignItems: 'center',
                  background: darkMode ? 'rgba(249,115,22,0.05)' : '#FFF7ED',
                  borderRadius: 8,
                  margin: '4px 0',
                }}>
                  <span style={{ fontSize: '0.74rem', color: darkMode ? '#FEBA74' : '#C2410C', fontWeight: 700 }}>
                    No registered school named "{searchQuery}" found in {district}.
                  </span>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleStartCustomSchool(searchQuery);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      color: '#FFF',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>➕ Register "{searchQuery || 'My School'}" Campus</span>
                  </button>
                </div>
              )}

              {/* 💡 Found in other Tamil Nadu districts suggestion */}
              {otherDistrictMatches.length > 0 && (
                <div style={{
                  marginTop: 4,
                  padding: '6px 8px',
                  background: darkMode ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#38BDF8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Compass size={12} /> Matching in Other Tamil Nadu Districts:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {otherDistrictMatches.map((otherItem) => (
                      <div
                        key={otherItem.name}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectOtherDistrictSchool(otherItem, otherItem.district);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: darkMode ? 'rgba(255,255,255,0.03)' : '#FFF',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
                        onMouseLeave={(e) => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : '#FFF'}
                      >
                        <span style={{ fontSize: '0.74rem', color: darkMode ? '#FFF' : '#0F172A', fontWeight: 600 }}>
                          {otherItem.name}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#38BDF8', background: 'rgba(59, 130, 246, 0.15)', padding: '1px 5px', borderRadius: 4 }}>
                          Switch to {otherItem.district} →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom "Add Unlisted School with Google Maps link" Option */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleStartCustomSchool('');
                }}
                style={{
                  marginTop: 4,
                  padding: '8px 10px',
                  borderRadius: 8,
                  borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: darkMode ? 'rgba(249,115,22,0.08)' : '#FFF7ED',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(249,115,22,0.18)' : '#FFEDD5'}
                onMouseLeave={(e) => e.currentTarget.style.background = darkMode ? 'rgba(249,115,22,0.08)' : '#FFF7ED'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#F97316', fontWeight: 900, fontSize: '0.9rem' }}>➕</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#F97316' }}>
                    Can't find your school? Add Google Maps Link
                  </span>
                </div>
                <ArrowRight size={13} color="#F97316" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected School Status Pill */}
      {selectedSchool && selectedSchool.trim() && !isCustomSchool && selectedSchoolObj && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: darkMode ? 'rgba(16, 185, 129, 0.08)' : '#F0FDF4',
          border: '1px solid rgba(16, 185, 129, 0.28)',
          borderRadius: 8,
          padding: '6px 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
            <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', minWidth: 0 }}>
              <span style={{ fontSize: '0.72rem', color: darkMode ? '#FFF' : '#0F172A', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ✓ Selected: <strong>{selectedSchool}</strong>
              </span>
              {selectedSchoolObj.area && (
                <span style={{ fontSize: '0.64rem', color: '#F97316', fontWeight: 800, background: darkMode ? 'rgba(249,115,22,0.15)' : '#FFEDD5', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  📍 {selectedSchoolObj.area}
                </span>
              )}
            </div>
          </div>
          {selectedSchoolObj.mapsLink ? (
            <a
              href={selectedSchoolObj.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.64rem',
                color: '#10B981',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                marginLeft: 8,
                padding: '2px 6px',
                borderRadius: 4,
                background: darkMode ? 'rgba(16,185,129,0.12)' : '#DCFCE7',
              }}
            >
              <span>Driver Navigation Map</span>
              <ExternalLink size={10} />
            </a>
          ) : (
            <span style={{ fontSize: '0.64rem', color: '#10B981', fontWeight: 800, whiteSpace: 'nowrap', marginLeft: 6 }}>
              📍 GPS Verified for Driver Delivery
            </span>
          )}
        </div>
      )}

      {/* Custom / Unlisted School Box with Google Maps Link */}
      {isCustomSchool && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 2,
          padding: '12px',
          background: darkMode ? 'rgba(249,115,22,0.06)' : '#FFF7ED',
          border: '1.5px dashed rgba(249,115,22,0.4)',
          borderRadius: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.72rem',
              color: '#F97316',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Compass size={14} /> Add Unlisted School & Navigation Link
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCustomSchool(false);
                setIsUserCustomChoice(false);
                if (schools.length > 0) {
                  selectSchoolItem(schools[0]);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: darkMode ? '#94A3B8' : '#64748B',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ← Back to School List
            </button>
          </div>

          {/* School Name & Board */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: darkMode ? '#CBD5E1' : '#475569', fontWeight: 700, marginBottom: 4 }}>
                Exact School Campus Name in {district} *
              </label>
              <input
                type="text"
                value={customSchoolName}
                onChange={handleCustomSchoolInput}
                placeholder={`e.g. Government Higher Secondary School, ${district}`}
                required
                style={{
                  width: '100%',
                  height: 38,
                  boxSizing: 'border-box',
                  background: darkMode ? '#1A120B' : '#FFF',
                  border: '1.5px solid rgba(249,115,22,0.5)',
                  borderRadius: 8,
                  padding: '0 10px',
                  color: darkMode ? '#FFF' : '#0F172A',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: darkMode ? '#CBD5E1' : '#475569', fontWeight: 700, marginBottom: 4 }}>
                Board / Category
              </label>
              <select
                value={customBoard}
                onChange={(e) => setCustomBoard(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  boxSizing: 'border-box',
                  background: darkMode ? '#1A120B' : '#FFF',
                  border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                  borderRadius: 8,
                  padding: '0 8px',
                  color: darkMode ? '#FFF' : '#0F172A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                <option value="Government School">Government School</option>
                <option value="Matriculation">Matriculation</option>
                <option value="State Board">State Board</option>
                <option value="CBSE">CBSE</option>
                <option value="Anglo-Indian">Anglo-Indian</option>
                <option value="ICSE">ICSE</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* School Google Maps Link Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: '0.68rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase' }}>
                School Google Map Link (For Driver GPS Navigation) *
              </label>
              {customMapsLink && (
                <a
                  href={customMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.68rem',
                    color: '#10B981',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <ExternalLink size={12} /> Test Google Map Link
                </a>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <MapPin size={15} />
              </div>
              <input
                type="url"
                value={customMapsLink}
                onChange={handleMapsLinkChange}
                placeholder="Paste Google Maps share link (e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=...)"
                required
                style={{
                  width: '100%',
                  height: 40,
                  boxSizing: 'border-box',
                  background: darkMode ? '#1A120B' : '#FFF',
                  border: '1.5px solid #EA580C',
                  borderRadius: 8,
                  padding: '0 12px 0 32px',
                  color: darkMode ? '#FFF' : '#0F172A',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{
              marginTop: 5,
              fontSize: '0.68rem',
              color: darkMode ? '#CBD5E1' : '#64748B',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>
                💡 Paste the exact school main gate Google Maps link so our driver can navigate directly without calling you repeatedly.
              </span>
              {detectedCoords && (
                <span style={{ color: '#10B981', fontWeight: 800, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  ✓ GPS: {detectedCoords.lat.toFixed(4)}°N, {detectedCoords.lng.toFixed(4)}°E
                </span>
              )}
            </div>

            <div style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: darkMode ? 'rgba(234, 88, 12, 0.12)' : 'rgba(234, 88, 12, 0.08)',
              border: '1px solid rgba(234, 88, 12, 0.28)',
              fontSize: '0.70rem',
              color: darkMode ? '#FDBA74' : '#C2410C',
              lineHeight: 1.4
            }}>
              <strong>🛡️ Admin Verification Workflow:</strong> Once submitted with your Google Maps link, the LunchMate Admin team will verify the main gate entrance on the map and approve it into the permanent {district} {customBoard} registry.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
