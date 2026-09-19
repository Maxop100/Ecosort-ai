import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf,
  Flame,
  Shield,
  Sparkles,
  FileText,
  MapPin,
  LogIn,
  LogOut,
  Menu,
  X,
  History,
  QrCode,
  BarChart3,
  ChevronDown,
  User as UserIcon,
  Check
} from 'lucide-react';
import { User } from '../types';

export type AppTab = 'scan' | 'history' | 'admin' | 'impact' | 'deliverable' | 'terms' | 'privacy' | 'not-found';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  user: User | null;
  municipality: string;
  setMunicipality: (m: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  municipality,
  setMunicipality,
  onOpenAuth,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      id: 'scan' as const,
      label: 'Scan & Classify',
      shortLabel: 'Scan',
      icon: QrCode,
      description: 'AI vision & text segregation'
    },
    {
      id: 'history' as const,
      label: 'Scan History',
      shortLabel: 'History',
      icon: History,
      description: 'Past verified items'
    },
    {
      id: 'admin' as const,
      label: 'Municipal Rules',
      shortLabel: 'Rules',
      icon: Shield,
      description: 'RAG knowledge base'
    },
    {
      id: 'impact' as const,
      label: 'Streaks & Impact',
      shortLabel: 'Impact',
      icon: BarChart3,
      description: 'Eco-points & streak tracking'
    },
    {
      id: 'deliverable' as const,
      label: 'Project Brief',
      shortLabel: 'Brief',
      icon: FileText,
      description: 'SDG targets & architecture'
    }
  ];

  const municipalityOptions = [
    { value: 'general', label: 'General Standard', fullLabel: 'General Municipal Standard' },
    { value: 'san_francisco', label: 'San Francisco', fullLabel: 'San Francisco (Zero Waste)' },
    { value: 'bengaluru', label: 'Bengaluru', fullLabel: 'Bengaluru (BBMP 2-Bins 1-Bag)' },
    { value: 'london', label: 'London', fullLabel: 'London (Borough Rules)' }
  ];

  const handleTabSelect = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E0E7E0] transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4 lg:gap-6">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0 py-1"
            onClick={() => handleTabSelect('scan')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#2D6A4F] flex items-center justify-center text-white shadow-xs transition-transform hover:scale-105 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl text-[#1B4332] tracking-tight font-['Space_Grotesk'] leading-none">
                  EcoSort<span className="text-[#52B788]">AI</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
                  RAG
                </span>
              </div>
              <p className="text-[10px] text-[#52796F] font-medium hidden md:block mt-0.5 tracking-wide">
                SDG 11 & 12 • Waste Advisor
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Consistent, Responsive & Sleek) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 bg-[#F0F4EF] p-1.5 rounded-2xl border border-[#E0E7E0] shadow-2xs shrink min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSpecial = item.id === 'deliverable';
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  id={`nav-tab-${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabSelect(item.id);
                  }}
                  title={item.description}
                  className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? isSpecial
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-white text-[#1B4332] shadow-xs'
                      : isSpecial
                      ? 'text-[#2D6A4F] hover:bg-[#D8F3DC]/60'
                      : 'text-[#40916C] hover:text-[#1B4332] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive && !isSpecial ? 'text-[#2D6A4F]' : ''}`} />
                  <span className="inline xl:hidden">{item.shortLabel}</span>
                  <span className="hidden xl:inline">{item.id === 'deliverable' ? 'SDG Brief' : item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Controls: Municipality + Streak + Profile & Logout + Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
            {/* Municipality Selector (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#1B4332] bg-white border border-[#E0E7E0] px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs hover:border-[#B7E4C7] transition-colors shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
              <div className="relative flex items-center">
                <select
                  id="municipality-select"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="bg-transparent font-semibold text-[#1B4332] outline-none cursor-pointer pr-3.5 appearance-none text-xs"
                >
                  {municipalityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#52796F] pointer-events-none absolute right-0" />
              </div>
            </div>

            {/* User Streak Badge (When Logged In) */}
            {user && (
              <div
                title="Consecutive Days of Waste Segregation"
                className="flex items-center gap-1 bg-[#D8F3DC] border border-[#B7E4C7] px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold text-[#1B4332] shadow-2xs shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                <span>{user.streak}d</span>
              </div>
            )}

            {/* Points Badge (Wide Screens only) */}
            {user && (
              <div
                title="Eco-Points Earned"
                className="hidden 2xl:flex items-center gap-1 bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-1 rounded-full text-xs font-bold text-[#2D6A4F] shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                <span>{user.points} pts</span>
              </div>
            )}

            {/* User Profile / Account Menu & Authentication */}
            {user ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  id="user-profile-menu-btn"
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl bg-white border border-[#E0E7E0] hover:border-[#B7E4C7] hover:bg-[#F7F9F6] transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                >
                  <div
                    title={user.name}
                    className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-[#1B4332] transition-colors shrink-0"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#1B4332] max-w-[90px] truncate leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#52796F] capitalize font-medium leading-tight">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#52796F] transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180 text-[#1B4332]' : ''
                    }`}
                  />
                </button>

                {/* Professional Dropdown Card */}
                {isUserMenuOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E0E7E0] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {/* User Header */}
                    <div className="p-3 bg-[#F7F9F6] rounded-xl border border-[#E0E7E0] mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1B4332] truncate">{user.name}</p>
                          <p className="text-[11px] text-[#52796F] truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
                            {user.role === 'admin' ? 'Municipal Admin' : 'Verified Resident'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Eco Stats Bar */}
                      <div className="mt-3 pt-2.5 border-t border-[#E0E7E0] grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-white p-1.5 rounded-lg border border-[#E0E7E0]">
                          <span className="block text-[10px] text-[#52796F]">Eco-Points</span>
                          <span className="font-bold text-[#1B4332]">{user.points}</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-[#E0E7E0]">
                          <span className="block text-[10px] text-[#52796F]">Daily Streak</span>
                          <span className="font-bold text-amber-600">{user.streak} days</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Navigation Items */}
                    <div className="space-y-0.5 text-xs text-[#1B4332]">
                      <button
                        type="button"
                        onClick={() => {
                          handleTabSelect('impact');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F0F4EF] transition-colors text-left font-medium cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-[#2D6A4F]" />
                        <span>My Badges & Streaks</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleTabSelect('history');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F0F4EF] transition-colors text-left font-medium cursor-pointer"
                      >
                        <History className="w-4 h-4 text-[#2D6A4F]" />
                        <span>Item Scan History</span>
                      </button>
                      <button
                        id="auth-switch-account-btn"
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F0F4EF] transition-colors text-left font-medium cursor-pointer text-[#2D6A4F]"
                      >
                        <UserIcon className="w-4 h-4 text-[#2D6A4F]" />
                        <span>Switch Account / Sign In</span>
                      </button>
                    </div>

                    <div className="my-1.5 border-t border-[#E0E7E0]" />

                    {/* Sign Out Button */}
                    <button
                      id="auth-logout-btn"
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#C0392B] hover:bg-red-50 rounded-xl transition-colors cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-[#C0392B] group-hover:translate-x-0.5 transition-transform" />
                        <span>Sign Out</span>
                      </span>
                      <span className="text-[10px] text-[#C0392B]/70 font-normal">End session</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="auth-login-btn"
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#153427] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm hover:scale-[1.02] cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Toggle (Visible on screens smaller than lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1B4332] hover:bg-[#F0F4EF] rounded-xl border border-[#E0E7E0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 shrink-0"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#1B4332]" /> : <Menu className="w-5 h-5 text-[#1B4332]" />}
            </button>
          </div>
        </div>

        {/* Quick-Access Mobile Navigation Bar (< lg screens) */}
        <div className="lg:hidden flex items-center py-2.5 border-t border-[#E0E7E0]/80 overflow-x-auto scrollbar-none gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'bg-[#F0F4EF] text-[#2D6A4F] hover:bg-[#D8F3DC]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Mobile Drawer with Full Controls */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E0E7E0] py-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Municipality Selector for Mobile */}
            <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-[#E0E7E0]">
              <label className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Select Municipality Jurisdiction
              </label>
              <select
                value={municipality}
                onChange={(e) => {
                  setMunicipality(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-white border border-[#E0E7E0] rounded-xl px-3 py-2 text-xs font-semibold text-[#1B4332] outline-none shadow-2xs"
              >
                {municipalityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.fullLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Item Cards */}
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#D8F3DC] text-[#1B4332] font-bold border border-[#B7E4C7]'
                        : 'hover:bg-[#F0F4EF] text-[#2D6A4F] font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[#2D6A4F] text-white' : 'bg-[#E0E7E0] text-[#1B4332]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[11px] text-[#52796F] font-normal">{item.description}</div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legal & Compliance Secondary Links */}
            <div className="pt-2 border-t border-[#E0E7E0] grid grid-cols-3 gap-1 text-center text-xs font-semibold text-[#52796F]">
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabSelect('terms');
                }}
                className="py-2.5 px-2 hover:bg-[#F0F4EF] rounded-xl text-[#2D6A4F] flex items-center justify-center min-h-[44px]"
              >
                Terms
              </a>
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabSelect('privacy');
                }}
                className="py-2.5 px-2 hover:bg-[#F0F4EF] rounded-xl text-[#2D6A4F] flex items-center justify-center min-h-[44px]"
              >
                Privacy
              </a>
              <a
                href="#404"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabSelect('not-found');
                }}
                className="py-2.5 px-2 hover:bg-[#F0F4EF] rounded-xl text-[#52796F] flex items-center justify-center min-h-[44px]"
              >
                404 Demo
              </a>
            </div>

            {/* User Account / Session Details */}
            {user ? (
              <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-[#E0E7E0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1B4332]">{user.name}</p>
                      <p className="text-[10px] text-[#52796F]">{user.points} eco-points • {user.streak}d streak</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
                    {user.role}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2 px-3 text-xs font-bold bg-white border border-[#B7E4C7] text-[#2D6A4F] rounded-xl hover:bg-[#F0FFF4] active:bg-[#D8F3DC] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Switch</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 text-xs font-bold bg-white border border-red-200 text-[#C0392B] rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#153427] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Demo User</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

