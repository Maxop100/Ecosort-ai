import React from 'react';
import {
  Flame,
  Award,
  Sparkles,
  TreeDeciduous,
  Globe2,
  Trash2,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';
import { User, SystemStats } from '../types';

interface StreakStatsBannerProps {
  user: User | null;
  stats: SystemStats | null;
  onOpenCertificate?: () => void;
  onOpenDropOff?: () => void;
}

const BADGES = [
  {
    id: 'badge-first',
    name: 'First Sort',
    description: 'Completed your first AI-guided item segregation.',
    icon: '🌱',
    reqPoints: 10
  },
  {
    id: 'badge-streak-3',
    name: '3-Day Eco Streak',
    description: 'Maintained daily proper waste sorting habit for 3 days.',
    icon: '🔥',
    reqStreak: 3
  },
  {
    id: 'badge-hazard',
    name: 'Hazard Neutralizer',
    description: 'Safely identified hazardous materials preventing landfill fires.',
    icon: '🛡️',
    reqPoints: 40
  },
  {
    id: 'badge-ewaste',
    name: 'E-Waste Guardian',
    description: 'Diverted valuable electronics and copper cords from trash.',
    icon: '⚡',
    reqPoints: 70
  },
  {
    id: 'badge-master',
    name: 'Zero Waste Champion',
    description: 'Surpassed 100 eco points and prevented 10+ kg CO₂ emissions.',
    icon: '🏆',
    reqPoints: 100
  },
];

export const StreakStatsBanner: React.FC<StreakStatsBannerProps> = ({
  user,
  stats,
  onOpenCertificate,
  onOpenDropOff
}) => {
  const points = user?.points || 15;
  const streak = user?.streak || 1;

  // Compute eco level
  let levelTitle = 'Eco Novice';
  let nextLevelPoints = 50;
  if (points >= 200) {
    levelTitle = 'Circular Economy Champion';
    nextLevelPoints = 500;
  } else if (points >= 100) {
    levelTitle = 'Zero Waste Pioneer';
    nextLevelPoints = 200;
  } else if (points >= 50) {
    levelTitle = 'Segregation Specialist';
    nextLevelPoints = 100;
  }

  const levelProgress = Math.min(Math.round((points / nextLevelPoints) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Top Banner: User Streak & Impact Overview */}
      <div className="bg-[#1B4332] rounded-3xl text-white p-6 sm:p-8 border border-[#2D6A4F] shadow-sm relative overflow-hidden">
        {/* Subtle geometric circle accent */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#40916C] rounded-full opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: User Level & Streak */}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#52B788] text-white text-xs font-bold tracking-wide shadow-xs">
                SDG 11 & 12 Impact
              </span>
              <span className="text-xs text-[#D8F3DC]">
                Logged in as <strong className="text-white font-bold">{user?.name || 'Eco Citizen'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F] border border-[#40916C] flex items-center justify-center text-amber-400 shadow-xs">
                <Flame className="w-8 h-8 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white">
                    {streak} Day{streak !== 1 ? 's' : ''}
                  </h1>
                  <span className="text-xs uppercase tracking-wider text-[#52B788] font-bold">
                    Active Streak
                  </span>
                </div>
                <p className="text-xs text-[#D8F3DC]/85 mt-0.5 font-medium">
                  Scan daily to maintain your household segregation momentum.
                </p>
              </div>
            </div>

            {/* Level Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-[#52B788]">{levelTitle}</span>
                <span className="text-[#D8F3DC]">{points} / {nextLevelPoints} pts</span>
              </div>
              <div className="w-full bg-[#2D6A4F] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#52B788] h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>

              {/* Certificate Generator Trigger Button */}
              {onOpenCertificate && (
                <button
                  type="button"
                  id="generate-cert-btn"
                  onClick={onOpenCertificate}
                  className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#52B788] hover:bg-[#40916C] text-[#081C15] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02]"
                >
                  <Award className="w-4 h-4 text-[#081C15]" />
                  <span>Generate Official SDG 11 & 12 Certificate</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Real-World Diverted Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-[#40916C]/60 pt-5 lg:pt-0 lg:pl-6">
            <div className="bg-[#2D6A4F]/80 p-4 rounded-2xl border border-[#40916C]">
              <div className="text-[10px] uppercase font-bold text-[#D8F3DC] tracking-wider flex items-center gap-1">
                <TreeDeciduous className="w-3.5 h-3.5 text-[#52B788]" />
                <span>CO₂ Avoided</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {user ? (Math.round((user.points * 0.04) * 10) / 10) : 2.4} kg
              </div>
              <div className="text-[10px] text-[#B7E4C7] mt-0.5">Methane & energy savings</div>
            </div>

            <div className="bg-[#2D6A4F]/80 p-4 rounded-2xl border border-[#40916C]">
              <div className="text-[10px] uppercase font-bold text-[#D8F3DC] tracking-wider flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Landfill Spared</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {user ? Math.round(user.points * 0.2) : 18} Liters
              </div>
              <div className="text-[10px] text-[#B7E4C7] mt-0.5">Volume saved</div>
            </div>

            <div className="bg-[#2D6A4F]/80 p-4 rounded-2xl border border-[#40916C] col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-[#D8F3DC] tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Points</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {points}
              </div>
              <div className="text-[10px] text-[#B7E4C7] mt-0.5">+15 per scan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Carousel / Grid */}
      <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-[#1B4332] font-['Space_Grotesk']">
              Habit Badges & Achievements
            </h3>
            <p className="text-xs text-[#52796F] font-medium">
              Recognizing consistent segregation compliance across household streams.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {BADGES.map((badge) => {
            const isUnlocked = badge.reqStreak
              ? streak >= badge.reqStreak
              : points >= (badge.reqPoints || 0);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-[#F0FFF4] border-[#B7E4C7] shadow-xs'
                    : 'bg-[#F7F9F6] border-[#E0E7E0] opacity-65'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#1B4332]">{badge.name}</h4>
                  {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                </div>
                <p className="text-[11px] text-[#52796F] mt-1 leading-normal font-medium">
                  {badge.description}
                </p>
                <div className="mt-2.5 text-[10px] font-bold text-[#52796F]">
                  {isUnlocked ? 'Unlocked' : badge.reqStreak ? `Requires ${badge.reqStreak}d streak` : `Requires ${badge.reqPoints} pts`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Collective Impact */}
      {stats && (
        <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-lg font-bold text-[#1B4332] font-['Space_Grotesk']">
                Community Collective SDG Impact
              </h3>
            </div>
            {onOpenDropOff && (
              <button
                type="button"
                id="open-dropoff-from-stats-btn"
                onClick={onOpenDropOff}
                className="px-3 py-1.5 rounded-xl border border-[#B7E4C7] bg-[#F0FFF4] hover:bg-[#D8F3DC] text-[#1B4332] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Municipal Drop-Off Depots</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4.5 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0]">
              <div className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider">
                Total Items Sorted
              </div>
              <div className="text-2xl font-bold text-[#1B4332] mt-1">
                {stats.totalScans}
              </div>
              <div className="text-[10px] text-[#52796F] mt-0.5 font-medium">Across all users</div>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9]">
              <div className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                Recyclables Diverted
              </div>
              <div className="text-2xl font-bold text-[#1B4332] mt-1">
                {stats.recycledCount}
              </div>
              <div className="text-[10px] text-[#2D6A4F] mt-0.5 font-medium">Clean containers</div>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#D8F3DC] border border-[#B7E4C7]">
              <div className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
                Organic Composted
              </div>
              <div className="text-2xl font-bold text-[#1B4332] mt-1">
                {stats.organicCount}
              </div>
              <div className="text-[10px] text-[#2D6A4F] mt-0.5 font-medium">Methane avoided</div>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2]">
              <div className="text-[11px] font-bold text-[#D35400] uppercase tracking-wider">
                Hazardous Neutralized
              </div>
              <div className="text-2xl font-bold text-[#A04000] mt-1">
                {stats.hazardousCount}
              </div>
              <div className="text-[10px] text-[#D35400] mt-0.5 font-medium">Fires/toxic leaks prevented</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
