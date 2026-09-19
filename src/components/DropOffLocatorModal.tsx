import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, AlertTriangle, ExternalLink, X, Building2, Filter, ShieldCheck } from 'lucide-react';
import { DropOffLocation, WasteCategory } from '../types';

interface DropOffLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMunicipality?: string;
  defaultCategory?: WasteCategory;
}

export const DropOffLocatorModal: React.FC<DropOffLocatorModalProps> = ({
  isOpen,
  onClose,
  defaultMunicipality = 'general',
  defaultCategory
}) => {
  const [locations, setLocations] = useState<DropOffLocation[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(
    defaultMunicipality === 'general' ? 'all' : defaultMunicipality
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory || 'all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
    }
  }, [isOpen, selectedMunicipality, selectedCategory]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMunicipality !== 'all') params.append('municipality', selectedMunicipality);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const res = await fetch(`/api/dropoff-locations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error('Failed to load drop-off locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const openGoogleMaps = (address: string, name: string) => {
    const query = encodeURIComponent(`${name}, ${address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E0E7E0] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-[#1B4332] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F] border border-[#40916C] flex items-center justify-center text-white shrink-0">
              <MapPin className="w-5 h-5 text-[#D8F3DC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#52B788] text-white">
                  Municipal Infrastructure
                </span>
                <span className="text-xs text-[#D8F3DC]">Zero Illegal Dumping</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-white">
                Municipal Drop-Off Depots & SAFE Centers
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#D8F3DC] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Protocol Banner */}
        <div className="bg-[#FFFBEB] px-6 py-3 border-b border-amber-200 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Mandate:</strong> Cover lithium battery terminals with clear tape prior to transit. Keep liquids in tightly sealed, labeled containers.
          </span>
        </div>

        {/* Filters */}
        <div className="p-4 sm:px-6 bg-[#F7F9F6] border-b border-[#E0E7E0] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Municipality Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#52796F] font-semibold mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> City:
            </span>
            {['all', 'New York City', 'San Francisco', 'Tokyo', 'Berlin', 'general'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedMunicipality(city)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  selectedMunicipality === city
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-[#52796F] border border-[#E0E7E0]'
                }`}
              >
                {city === 'all' ? 'All Municipalities' : city === 'general' ? 'Universal / Retail' : city}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#52796F]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#E0E7E0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#1B4332] outline-none cursor-pointer"
            >
              <option value="all">All Material Types</option>
              <option value="hazardous">Hazardous Waste (Chemicals/Batteries)</option>
              <option value="e-waste">Electronic Waste (WEEE)</option>
              <option value="recyclable">Rigid Recyclables</option>
              <option value="organic">Organic / Food Scraps</option>
            </select>
          </div>
        </div>

        {/* Location Cards List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#52796F]">
              <div className="w-7 h-7 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading verified municipal drop-off points...
            </div>
          ) : locations.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#52796F]">
              No drop-off facilities found matching this filter criteria.
            </div>
          ) : (
            locations.map((loc) => (
              <div
                key={loc.id}
                className="p-5 rounded-2xl border border-[#E0E7E0] bg-white hover:border-[#B7E4C7] transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-[#1B4332]">
                        {loc.name}
                      </span>
                      {loc.isSpecializedHazardous && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Hazardous Certified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#52796F] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      <span>{loc.address}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openGoogleMaps(loc.address, loc.name)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F0FFF4] hover:bg-[#D8F3DC] text-[#1B4332] font-bold text-xs border border-[#B7E4C7] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer self-start"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F0F4EF]">
                  <div className="flex items-center gap-2 text-[#52796F]">
                    <Clock className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    <span className="font-medium">{loc.hours}</span>
                  </div>
                  {loc.phone && (
                    <div className="flex items-center gap-2 text-[#52796F]">
                      <Phone className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      <span>{loc.phone}</span>
                    </div>
                  )}
                </div>

                {/* Notes & Accepted Categories */}
                <div className="bg-[#F7F9F6] p-3 rounded-xl text-xs text-[#1B4332] space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed font-medium">{loc.notes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#52796F]">Accepted:</span>
                    {loc.acceptedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#E0E7E0] text-[10px] font-bold text-[#1B4332]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F9F6] border-t border-[#E0E7E0] flex items-center justify-between text-xs text-[#52796F]">
          <span>Official Municipal Public Works & Sanitation Facilities</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#E0E7E0] font-bold text-[#1B4332] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
