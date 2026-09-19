import React, { useState } from 'react';
import {
  Trash2,
  ArrowLeft,
  Search,
  Home,
  MapPin,
  FileText,
  Shield,
  HelpCircle,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface NotFoundPageProps {
  currentPath?: string;
  onNavigate: (tab: 'scan' | 'history' | 'admin' | 'impact' | 'deliverable' | 'terms' | 'privacy') => void;
  onQuickSearch?: (query: string) => void;
  onOpenDropOff?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  currentPath = window.location.pathname || '/unknown',
  onNavigate,
  onQuickSearch,
  onOpenDropOff
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (onQuickSearch) {
        onQuickSearch(searchInput.trim());
      }
      onNavigate('scan');
    }
  };

  const sampleItems = [
    'Milk Carton',
    'Lithium Battery',
    'Pizza Box',
    'Glass Bottle',
    'Bubble Wrap'
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 text-center animate-in fade-in duration-200">
      {/* Visual Indicator Container */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6">
        {/* Soft pulsing halo */}
        <div className="absolute inset-0 rounded-full bg-[#E8F5E9] animate-pulse" />

        {/* Outer circular container */}
        <div className="relative w-full h-full rounded-full border-4 border-dashed border-[#B7E4C7] flex flex-col items-center justify-center bg-white shadow-md">
          <Trash2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#2D6A4F] animate-bounce duration-1000" />
          <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full text-xs font-black bg-[#1B4332] text-white border-2 border-[#52B788] shadow-xs">
            404
          </span>
        </div>
      </div>

      {/* Main Headings */}
      <div className="space-y-2 mb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7] inline-block">
          Recycling Stream Diverted
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B4332] font-['Space_Grotesk'] tracking-tight">
          Page Not Found in Sorting Facility
        </h1>
        <p className="text-sm sm:text-base text-[#52796F] max-w-lg mx-auto leading-relaxed">
          The address you requested could not be classified. It may have biodegraded, been removed by municipal sanitation, or entered the wrong recycling stream.
        </p>
      </div>

      {/* Path Callout Box */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0F4EF] border border-[#E0E7E0] text-xs text-[#52796F] font-mono mb-8 max-w-md truncate">
        <AlertCircle className="w-4 h-4 text-[#2D6A4F] shrink-0" />
        <span>Unrecognized Route:</span>
        <strong className="text-[#1B4332] truncate">{currentPath}</strong>
      </div>

      {/* Instant Waste Classifier Quick Jump */}
      <div className="bg-white rounded-3xl border border-[#B7E4C7] p-6 shadow-sm mb-8 max-w-xl mx-auto text-left">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
          <h3 className="font-bold text-sm text-[#1B4332] font-['Space_Grotesk']">
            Were you trying to classify a waste item?
          </h3>
        </div>
        <p className="text-xs text-[#52796F] mb-3">
          Type any household item to jump directly to the AI Waste Classifier:
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52796F]" />
            <input
              type="text"
              id="404-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g., AA battery, cardboard takeout container, lightbulb..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9F6] border border-[#E0E7E0] rounded-xl text-[#1B4332] focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>Classify</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        </form>

        {/* Popular Item Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-[#F0F4EF]">
          <span className="text-[10px] uppercase font-bold text-[#52796F]">Try:</span>
          {sampleItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSearchInput(item);
                if (onQuickSearch) onQuickSearch(item);
                onNavigate('scan');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F0F4EF] hover:bg-[#D8F3DC] text-[11px] font-medium text-[#1B4332] border border-[#E0E7E0] transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-8">
        <button
          type="button"
          onClick={() => onNavigate('scan')}
          className="p-4 rounded-2xl bg-white hover:bg-[#F0FFF4] border border-[#E0E7E0] hover:border-[#B7E4C7] transition-all flex flex-col items-center text-center group cursor-pointer shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-[#1B4332]">AI Waste Scanner</span>
          <span className="text-[10px] text-[#52796F] mt-0.5">Identify waste & recycling</span>
        </button>

        {onOpenDropOff ? (
          <button
            type="button"
            onClick={onOpenDropOff}
            className="p-4 rounded-2xl bg-white hover:bg-[#F0FFF4] border border-[#E0E7E0] hover:border-[#B7E4C7] transition-all flex flex-col items-center text-center group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-[#1B4332]">Drop-Off Depots</span>
            <span className="text-[10px] text-[#52796F] mt-0.5">Locate SAFE hazardous centers</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('impact')}
            className="p-4 rounded-2xl bg-white hover:bg-[#F0FFF4] border border-[#E0E7E0] hover:border-[#B7E4C7] transition-all flex flex-col items-center text-center group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-[#1B4332]">Eco-Citizen Impact</span>
            <span className="text-[10px] text-[#52796F] mt-0.5">Streaks & certificates</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate('terms')}
          className="p-4 rounded-2xl bg-white hover:bg-[#F0FFF4] border border-[#E0E7E0] hover:border-[#B7E4C7] transition-all flex flex-col items-center text-center group cursor-pointer shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-[#1B4332]">Legal & Privacy</span>
          <span className="text-[10px] text-[#52796F] mt-0.5">Terms & Privacy Policies</span>
        </button>
      </div>

      {/* Return Home Button */}
      <button
        type="button"
        id="return-home-from-404"
        onClick={() => onNavigate('scan')}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Primary Scanner</span>
      </button>
    </div>
  );
};
