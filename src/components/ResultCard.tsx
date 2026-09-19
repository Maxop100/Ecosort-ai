import React from 'react';
import {
  Recycle,
  Apple,
  Cpu,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
  Building2,
  Share2,
  BookOpen,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScanResultResponse, WasteCategory } from '../types';
import { DecompositionTimeline } from './DecompositionTimeline';
import { UpcycleStudio } from './UpcycleStudio';

interface ResultCardProps {
  result: ScanResultResponse;
  onScanAnother: () => void;
  onViewHistory: () => void;
  onOpenDropOff?: () => void;
  onBonusPoints?: (points: number) => void;
}

const CATEGORY_CONFIG: Record<
  WasteCategory,
  {
    label: string;
    binName: string;
    binColorName: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    binBadgeBg: string;
    icon: React.ElementType;
    description: string;
  }
> = {
  recyclable: {
    label: 'Recyclable Material',
    binName: 'Blue Recycling Bin',
    binColorName: 'Blue',
    bgClass: 'bg-blue-50/80',
    textClass: 'text-blue-900',
    borderClass: 'border-blue-200',
    binBadgeBg: 'bg-blue-600 text-white',
    icon: Recycle,
    description: 'Clean rigid containers, metals, dry cardboard, paper, and rigid plastics suitable for mechanical remanufacturing.'
  },
  organic: {
    label: 'Organic / Wet Waste',
    binName: 'Green Compost Bin',
    binColorName: 'Green',
    bgClass: 'bg-emerald-50/80',
    textClass: 'text-emerald-900',
    borderClass: 'border-emerald-200',
    binBadgeBg: 'bg-emerald-600 text-white',
    icon: Apple,
    description: 'Biodegradable food scraps, fruit peels, compostable paper, and garden leaves for composting or anaerobic digestion.'
  },
  'e-waste': {
    label: 'Electronic Waste (WEEE)',
    binName: 'Yellow E-Waste Depot / Kiosk',
    binColorName: 'Yellow / Orange',
    bgClass: 'bg-amber-50/80',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-200',
    binBadgeBg: 'bg-amber-500 text-stone-900',
    icon: Cpu,
    description: 'Items with electrical plugs, printed circuit boards, lithium batteries, or cords. Contains recyclable precious metals.'
  },
  hazardous: {
    label: 'Hazardous Waste (Special Handling)',
    binName: 'Red Hazardous Waste / HHW Collection',
    binColorName: 'Red',
    bgClass: 'bg-rose-50/80',
    textClass: 'text-rose-900',
    borderClass: 'border-rose-200',
    binBadgeBg: 'bg-rose-600 text-white',
    icon: AlertTriangle,
    description: 'Chemicals, lithium cells, flammables, toxic paints, fluorescent tubes, or sharp biomedical rejects.'
  },
  general: {
    label: 'General Waste / Landfill Reject',
    binName: 'Black / Gray Landfill Bin',
    binColorName: 'Black / Gray',
    bgClass: 'bg-stone-50/80',
    textClass: 'text-stone-900',
    borderClass: 'border-stone-200',
    binBadgeBg: 'bg-stone-800 text-white',
    icon: Trash2,
    description: 'Non-recyclable composite packaging, multi-layer laminates, sanitary waste, or contaminated ceramics.'
  },
  'general-waste': {
    label: 'General Waste / Landfill Reject',
    binName: 'Black / Gray Landfill Bin',
    binColorName: 'Black / Gray',
    bgClass: 'bg-stone-50/80',
    textClass: 'text-stone-900',
    borderClass: 'border-stone-200',
    binBadgeBg: 'bg-stone-800 text-white',
    icon: Trash2,
    description: 'Non-recyclable composite packaging, multi-layer laminates, sanitary waste, or contaminated ceramics.'
  }
};

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onScanAnother,
  onViewHistory,
  onOpenDropOff,
  onBonusPoints
}) => {
  const { record, pointsEarned, currentStreak, co2SavedKg, matchedRule } = result;
  const config = CATEGORY_CONFIG[record.aiCategory] || CATEGORY_CONFIG.general;
  const CategoryIcon = config.icon;
  const confidencePercent = Math.round(record.aiConfidence * 100);

  const itemName =
    record.inputType === 'text'
      ? record.inputData
      : matchedRule?.itemKeyword.split(',')[0] || config.label;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner: Category & AI Classification with Geometric Balance Signature Header */}
      <div className="p-6 sm:p-8 bg-[#1B4332] text-white relative overflow-hidden">
        {/* Subtle geometric background circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#40916C] rounded-full opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F] border border-[#40916C] flex items-center justify-center shrink-0 shadow-xs text-[#D8F3DC]">
              <CategoryIcon className="w-7 h-7 text-[#D8F3DC]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#52B788] text-white shadow-xs">
                  {config.binName}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[#D8F3DC]">
                  {confidencePercent}% AI Confidence
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5 font-['Space_Grotesk'] tracking-tight">
                {config.label}
              </h1>
              <p className="text-xs sm:text-sm text-[#D8F3DC]/90 mt-1 leading-relaxed">
                {config.description}
              </p>
            </div>
          </div>

          {/* Gamification Badge Pill */}
          <div className="sm:text-right shrink-0 bg-[#2D6A4F]/80 p-3.5 rounded-2xl border border-[#40916C] shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white justify-start sm:justify-end">
              <Sparkles className="w-4 h-4 text-[#52B788]" />
              <span>+{pointsEarned} Eco Points</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D8F3DC] justify-start sm:justify-end mt-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Streak: {currentStreak} days</span>
            </div>
            <div className="text-[11px] text-[#B7E4C7] mt-0.5">
              ~{co2SavedKg} kg CO₂ avoided
            </div>
          </div>
        </div>
      </div>

      {/* Body: Transparent AI Reasoning & RAG Guidance */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Scanned Input Snapshot */}
        <div className="bg-[#F7F9F6] p-4 rounded-2xl border border-[#E0E7E0] flex items-center justify-between text-xs">
          <div className="truncate mr-2">
            <span className="font-bold text-[#52796F] uppercase tracking-wider text-[10px] block">
              Scanned Item
            </span>
            <span className="text-[#1B4332] font-semibold">
              {record.inputType === 'image' ? 'Visual photo scan' : `"${record.inputData}"`}
            </span>
          </div>
          <span className="text-[#52796F] shrink-0 text-[11px] font-medium">
            {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Section 1: RAG Municipal Disposal Instruction */}
        <div className="rounded-2xl border border-[#B7E4C7] bg-[#F0FFF4] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[#1B4332] font-bold text-sm mb-2">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
            <span>Official Municipal Disposal Instruction (RAG Retrieved)</span>
          </div>
          <p className="text-[#1B4332] text-sm sm:text-base leading-relaxed font-semibold">
            {record.disposalInstruction}
          </p>

          {/* RAG Metadata Citation */}
          {matchedRule && (
            <div className="mt-4 pt-3.5 border-t border-[#B7E4C7]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#2D6A4F]">
              <div className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>
                  Matched Rule: <strong className="text-[#1B4332]">{matchedRule.itemKeyword.split(',')[0]}</strong> ({matchedRule.municipality} ordinance)
                </span>
              </div>
              <span className="bg-white px-2.5 py-1 rounded-xl text-[11px] border border-[#B7E4C7] font-semibold text-[#1B4332]">
                Bin Color: {matchedRule.binColor || config.binColorName}
              </span>
            </div>
          )}
        </div>

        {/* Special Drop-Off Station Required Alert for Hazardous & E-Waste */}
        {(record.aiCategory === 'hazardous' || record.aiCategory === 'e-waste') && onOpenDropOff && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-amber-950">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-amber-950 text-xs sm:text-sm">
                  Designated SAFE Drop-Off Center Mandated
                </span>
                <span className="text-[11px] text-amber-800 font-medium">
                  Never deposit lithium batteries, fluorescent mercury tubes, or chemicals in curbside bins.
                </span>
              </div>
            </div>
            <button
              type="button"
              id="locate-dropoff-btn"
              onClick={onOpenDropOff}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer text-center"
            >
              Locate Municipal Depots
            </button>
          </div>
        )}

        {/* Section 2: Transparent AI Reasoning */}
        <div className="rounded-2xl border border-[#E0E7E0] p-5 sm:p-6 bg-[#F7F9F6]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#52796F] mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            AI Material Classification Reasoning
          </h4>
          <p className="text-[#1B4332] text-sm leading-relaxed font-medium">
            {record.reasoning}
          </p>
        </div>

        {/* Standout Feature 1: AI Upcycling & Circular Reuse Studio */}
        <UpcycleStudio
          itemName={itemName}
          category={record.aiCategory}
          onBonusPoints={onBonusPoints}
        />

        {/* Standout Feature 2: Interactive Decomposition & Environmental Degradation Timeline */}
        <DecompositionTimeline
          itemName={itemName}
          category={record.aiCategory}
        />

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="mark-disposed-btn"
            type="button"
            onClick={triggerCelebration}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
            <span>Mark as Correctly Disposed</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="scan-another-btn"
              type="button"
              onClick={onScanAnother}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#E0E7E0] bg-white hover:bg-[#F0FFF4] text-[#1B4332] font-bold text-xs transition-colors text-center cursor-pointer shadow-xs"
            >
              Scan Another Item
            </button>
            <button
              id="view-history-btn"
              type="button"
              onClick={onViewHistory}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#E0E7E0] bg-white hover:bg-[#F0FFF4] text-[#1B4332] font-bold text-xs transition-colors text-center cursor-pointer shadow-xs"
            >
              View in History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
