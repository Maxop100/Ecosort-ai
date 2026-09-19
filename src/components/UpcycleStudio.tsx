import React, { useState } from 'react';
import { Sparkles, Hammer, Clock, Leaf, CheckCircle2, ChevronRight, RefreshCw, Scissors, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UpcycleIdea, WasteCategory } from '../types';

interface UpcycleStudioProps {
  itemName: string;
  category: WasteCategory;
  onBonusPoints?: (points: number) => void;
}

export const UpcycleStudio: React.FC<UpcycleStudioProps> = ({ itemName, category, onBonusPoints }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<UpcycleIdea[]>([]);
  const [completedIdeaIds, setCompletedIdeaIds] = useState<string[]>([]);
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/upcycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemDescription: itemName, category })
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas || []);
        if (data.ideas?.length > 0) {
          setActiveIdeaId(data.ideas[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load upcycling ideas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStudio = () => {
    setIsOpen(true);
    if (ideas.length === 0) {
      fetchIdeas();
    }
  };

  const handleMarkCompleted = (idea: UpcycleIdea) => {
    if (!completedIdeaIds.includes(idea.id)) {
      setCompletedIdeaIds((prev) => [...prev, idea.id]);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      if (onBonusPoints) {
        onBonusPoints(25);
      }
    }
  };

  const activeIdea = ideas.find((i) => i.id === activeIdeaId) || ideas[0];

  return (
    <div className="rounded-2xl border border-[#B7E4C7] bg-[#F7FDF9] overflow-hidden shadow-2xs">
      {!isOpen ? (
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D8F3DC] border border-[#B7E4C7] flex items-center justify-center text-[#2D6A4F] shrink-0 shadow-2xs">
              <Lightbulb className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                  SDG 12 Circular Economy Feature
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B4332] text-white">
                  Upcycle Studio
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#1B4332] mt-0.5">
                Before discarding: Can you reuse or upcycle this item?
              </h4>
              <p className="text-xs text-[#52796F] mt-1 leading-relaxed max-w-xl">
                Generate 3 creative DIY household projects powered by Gemini AI to keep "{itemName}" out of the waste stream entirely.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="open-upcycle-btn"
            onClick={handleOpenStudio}
            className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-[#52B788]" />
            <span>Generate DIY Upcycles (+25 pts)</span>
          </button>
        </div>
      ) : (
        <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-[#B7E4C7]/60 pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#1B4332] font-['Space_Grotesk']">
                  AI Upcycle & Reuse Studio
                </h4>
                <p className="text-xs text-[#52796F]">
                  Target Material: <strong className="text-[#1B4332]">{itemName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchIdeas}
                disabled={isLoading}
                title="Regenerate new ideas"
                className="p-1.5 text-[#52796F] hover:text-[#1B4332] hover:bg-white rounded-lg transition-colors cursor-pointer border border-[#E0E7E0]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2D6A4F]' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[#52796F] hover:text-[#1B4332] px-2 py-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#52796F] font-semibold">
                Gemini AI is analyzing material composition & crafting DIY instructions...
              </p>
            </div>
          ) : ideas.length > 0 && activeIdea ? (
            <div className="space-y-4">
              {/* Idea Tab Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ideas.map((idea, idx) => {
                  const isSelected = idea.id === activeIdea.id;
                  const isCompleted = completedIdeaIds.includes(idea.id);
                  return (
                    <button
                      key={idea.id}
                      type="button"
                      onClick={() => setActiveIdeaId(idea.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                          : 'bg-white hover:bg-[#F0FFF4] text-[#1B4332] border-[#E0E7E0]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                        <span className={isSelected ? 'text-[#52B788]' : 'text-[#52796F]'}>
                          Project 0{idx + 1}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Reused
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs truncate">{idea.title}</div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] opacity-85">
                        <span>{idea.difficulty}</span>
                        <span>•</span>
                        <span>{idea.timeEstimate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Idea Detailed Card */}
              <div className="p-5 rounded-2xl bg-white border border-[#B7E4C7] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E7E0] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
                      {activeIdea.difficulty} • {activeIdea.timeEstimate}
                    </span>
                    <h5 className="text-base sm:text-lg font-bold text-[#1B4332] mt-1 font-['Space_Grotesk']">
                      {activeIdea.title}
                    </h5>
                    <p className="text-xs text-[#52796F] mt-0.5">{activeIdea.practicalUse}</p>
                  </div>

                  <div className="shrink-0 bg-[#E8F5E9] px-3 py-1.5 rounded-xl border border-[#C8E6C9] text-xs font-semibold text-[#2D6A4F] flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{activeIdea.co2SavingsEstimate}</span>
                  </div>
                </div>

                {/* Supplies / Tools Needed */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#52796F] block mb-2">
                    Household Tools & Supplies Needed
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeIdea.toolsNeeded.map((tool, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#F0F4EF] text-[#1B4332] text-xs font-medium border border-[#E0E7E0]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#52796F] block mb-2">
                    Step-by-Step DIY Guide
                  </span>
                  <div className="space-y-2">
                    {activeIdea.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-[#1B4332]">
                        <span className="w-5 h-5 rounded-full bg-[#D8F3DC] text-[#2D6A4F] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="flex-1 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complete Project Action */}
                <div className="pt-2 border-t border-[#E0E7E0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-[#52796F]">
                    {completedIdeaIds.includes(activeIdea.id)
                      ? '✓ You have pledged / completed this circular upcycle!'
                      : 'Saved from landfill? Mark this item as upcycled.'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleMarkCompleted(activeIdea)}
                    disabled={completedIdeaIds.includes(activeIdea.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                      completedIdeaIds.includes(activeIdea.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-[#2D6A4F] hover:bg-[#1B4332] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedIdeaIds.includes(activeIdea.id) ? 'Completed (+25 Eco Points)' : 'I Repurposed This! (+25 pts)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#52796F]">
              No upcycling ideas generated. Click refresh to try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
