import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Flame, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { WasteCategory } from '../types';
import { getDecompositionStats } from '../data/decomposition_data';

interface DecompositionTimelineProps {
  itemName: string;
  category: WasteCategory;
}

export const DecompositionTimeline: React.FC<DecompositionTimelineProps> = ({ itemName, category }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'landfill' | 'diverted'>('diverted');
  const stats = getDecompositionStats(itemName, category);

  // Compute log scale percentage for visual timeline representation (max 1,000,000 years)
  // 0.05 yrs (2-3 wks) -> 5%, 1 yr -> 25%, 500 yrs -> 75%, 1,000,000 yrs -> 100%
  const getTimelinePercent = (years: number) => {
    if (years <= 0.1) return 8;
    if (years <= 1) return 22;
    if (years <= 50) return 45;
    if (years <= 500) return 72;
    return 96;
  };

  const timelinePercent = getTimelinePercent(stats.yearsToDecompose);

  return (
    <div className="rounded-2xl border border-[#E0E7E0] bg-white overflow-hidden shadow-2xs transition-all">
      {/* Header bar with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#F7F9F6] transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2D6A4F] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#52796F]">
                Environmental Lifecycle Simulation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
                Decomposition: {stats.displayTime}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#1B4332] mt-0.5">
              What happens if this item is landfilled vs. responsibly diverted?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#2D6A4F] text-xs font-semibold shrink-0">
          <span>{isExpanded ? 'Hide Simulation' : 'View Impact'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-6 pt-2 border-t border-[#E0E7E0] space-y-5 animate-in fade-in duration-200">
          {/* Visual Timeline Gauge */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#52796F] font-medium">Decomposition Horizon</span>
              <span className="font-bold text-[#1B4332]">{stats.displayTime}</span>
            </div>

            {/* Custom Multi-Point Progress Bar */}
            <div className="relative w-full h-3.5 bg-[#F0F4EF] rounded-full overflow-hidden border border-[#E0E7E0]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.yearsToDecompose <= 0.2
                    ? 'bg-emerald-500'
                    : stats.yearsToDecompose <= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${timelinePercent}%` }}
              />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between items-center text-[10px] text-[#52796F] mt-1.5 px-0.5 font-medium">
              <span>Weeks (Organics)</span>
              <span>Months</span>
              <span>Decades</span>
              <span>Centuries (Plastics)</span>
              <span>Millennia (Glass)</span>
            </div>
          </div>

          {/* Scenario Comparison Toggle */}
          <div>
            <div className="flex rounded-xl bg-[#F0F4EF] p-1 border border-[#E0E7E0] mb-3 max-w-sm">
              <button
                type="button"
                onClick={() => setActiveScenario('diverted')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeScenario === 'diverted'
                    ? 'bg-[#2D6A4F] text-white shadow-2xs'
                    : 'text-[#52796F] hover:text-[#1B4332]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>If Correctly Sorted</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('landfill')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeScenario === 'landfill'
                    ? 'bg-[#C0392B] text-white shadow-2xs'
                    : 'text-[#52796F] hover:text-[#1B4332]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>If Discarded to Landfill</span>
              </button>
            </div>

            {/* Scenario Card */}
            {activeScenario === 'diverted' ? (
              <div className="p-4 rounded-xl bg-[#F0FFF4] border border-[#B7E4C7] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#1B4332]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Circular Lifecycle Outcome (Best Practice)</span>
                </div>
                <p className="text-[#2D6A4F] leading-relaxed">
                  Correct segregation eliminates landfill methane emissions and spares{' '}
                  <strong className="text-[#1B4332]">{stats.recyclingEnergySavedPercent}%</strong> of the energy
                  required to extract and process raw virgin natural resources.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-[#B7E4C7] font-semibold text-[#1B4332]">
                    Toxicity Risk: <strong className="text-[#2D6A4F]">Mitigated</strong>
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-[#B7E4C7] font-semibold text-[#1B4332]">
                    Material Reclaimed: <strong className="text-[#2D6A4F]">100%</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FFF5F5] border border-red-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Landfill Deposition Consequence</span>
                </div>
                <p className="text-red-800 leading-relaxed">
                  Under high mechanical compression, this item remains buried for{' '}
                  <strong className="text-red-950">{stats.displayTime}</strong>. Anoxic decomposition can generate ~
                  <strong className="text-red-950">{stats.landfillMethaneKg} kg</strong> of greenhouse methane or
                  leach chemical contaminants into surrounding soil strata.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-red-200 font-semibold text-red-900">
                    Microplastics / Toxicity Risk: <strong className="text-red-600">{stats.toxicityRisk}</strong>
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-red-200 font-semibold text-red-900">
                    Ocean Leakage Hazard: <strong className="text-red-600">{stats.oceanPollutionRisk}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Scientific Fun Fact */}
          <div className="p-3.5 rounded-xl bg-[#F7F9F6] border border-[#E0E7E0] flex items-start gap-2.5 text-xs text-[#52796F]">
            <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#1B4332]">Did you know?</strong> {stats.funFact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
