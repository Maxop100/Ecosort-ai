import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScanUploader } from './components/ScanUploader';
import { ResultCard } from './components/ResultCard';
import { HistoryTable } from './components/HistoryTable';
import { AdminRulesPanel } from './components/AdminRulesPanel';
import { StreakStatsBanner } from './components/StreakStatsBanner';
import { DeliverableModal } from './components/DeliverableModal';
import { AuthModal } from './components/AuthModal';
import { DropOffLocatorModal } from './components/DropOffLocatorModal';
import { CertificateModal } from './components/CertificateModal';
import { LegalPoliciesView } from './components/LegalPoliciesView';
import { NotFoundPage } from './components/NotFoundPage';
import { AppTab } from './components/Navbar';
import { User, ScanRecord, WasteRule, ScanResultResponse, SystemStats } from './types';
import { Sparkles, AlertCircle, Leaf, Shield, CheckCircle2, ArrowRight, Award, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('scan');
  const [detectedNotFoundPath, setDetectedNotFoundPath] = useState<string>('');
  const [quickSearchText, setQuickSearchText] = useState<string>('');
  const [municipality, setMunicipality] = useState<string>('general');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropOffModalOpen, setIsDropOffModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResultResponse | null>(null);
  const [rules, setRules] = useState<WasteRule[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBonusPoints = (pts: number) => {
    if (user) {
      const updatedUser = { ...user, points: user.points + pts };
      setUser(updatedUser);
      localStorage.setItem('ecosort_user', JSON.stringify(updatedUser));
      showToast(`🎉 Circular upcycle completed! +${pts} Eco-Points awarded.`, 'success');
    } else {
      showToast(`🎉 Circular upcycle completed! +${pts} Eco-Points awarded.`, 'success');
    }
  };

  // Load user from localStorage or auto-load demo
  useEffect(() => {
    const savedUser = localStorage.getItem('ecosort_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    } else {
      // Default to Demo user for immediate rich experience
      const defaultDemoUser: User = {
        id: 'user-demo-1',
        name: 'Eco Citizen (Demo)',
        email: 'demo@ecosort.org',
        role: 'user',
        points: 85,
        streak: 4,
        createdAt: new Date().toISOString()
      };
      setUser(defaultDemoUser);
      localStorage.setItem('ecosort_user', JSON.stringify(defaultDemoUser));
    }
  }, []);

  // Fetch initial data (rules, history, stats)
  useEffect(() => {
    fetchRules();
    fetchHistory();
    fetchStats();
  }, [user]);

  // Synchronize route pathname and hash for deep linking (e.g., /terms, /privacy, /404, etc.)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (hash === '#terms' || path === '/terms') {
        setActiveTab('terms');
        updateSeoMetadata('terms');
      } else if (hash === '#privacy' || path === '/privacy') {
        setActiveTab('privacy');
        updateSeoMetadata('privacy');
      } else if (hash === '#404' || hash === '#not-found' || path === '/404') {
        setDetectedNotFoundPath(path === '/404' ? '/404' : (path || '/not-found'));
        setActiveTab('not-found');
        updateSeoMetadata('not-found');
      } else if (hash === '#login' || hash === '#signin' || hash === '#signup' || path === '/login' || path === '/signin' || path === '/signup') {
        setIsAuthModalOpen(true);
        setActiveTab('scan');
        updateSeoMetadata('scan');
      } else if (hash === '#history' || path === '/history') {
        setActiveTab('history');
        updateSeoMetadata('history');
      } else if (hash === '#admin' || path === '/admin') {
        setActiveTab('admin');
        updateSeoMetadata('admin');
      } else if (hash === '#impact' || path === '/impact') {
        setActiveTab('impact');
        updateSeoMetadata('impact');
      } else if (hash === '#deliverable' || path === '/deliverable') {
        setActiveTab('deliverable');
        updateSeoMetadata('deliverable');
      } else if (hash === '#scan' || path === '/' || path === '') {
        setActiveTab('scan');
        updateSeoMetadata('scan');
      } else {
        // Unrecognized route -> Show 404 page
        setDetectedNotFoundPath(window.location.pathname);
        setActiveTab('not-found');
        updateSeoMetadata('not-found');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  const updateSeoMetadata = (tab: AppTab) => {
    const metaMap: Record<AppTab, { title: string; desc: string; slug: string }> = {
      scan: {
        title: 'EcoSort — AI Waste Segregation & Municipal Disposal Advisor',
        desc: 'AI-powered municipal waste segregation, computer vision classification, and circular upcycling advisor aligning with UN SDG 11 and SDG 12.',
        slug: '/scan'
      },
      history: {
        title: 'Segregation History & Audit Log — EcoSort AI',
        desc: 'Review past waste scans, verified municipal bin classifications, and confidence metrics in the EcoSort audit trail.',
        slug: '/history'
      },
      impact: {
        title: 'Eco-Citizen Impact & Badges — EcoSort AI',
        desc: 'Track daily segregation streaks, carbon offsets, and earned UN SDG 11 & SDG 12 community achievements.',
        slug: '/impact'
      },
      admin: {
        title: 'Municipal Bylaw Rules Manager — EcoSort AI',
        desc: 'Configure retrieval-augmented generation rules and municipal sanitation bylaws for localized sorting accuracy.',
        slug: '/admin'
      },
      deliverable: {
        title: 'Responsible AI Internship Project Brief — EcoSort AI',
        desc: 'Technical architecture diagram, ethical AI safeguards, and United Nations Sustainable Development Goals report.',
        slug: '/deliverable'
      },
      terms: {
        title: 'Terms & Conditions — EcoSort AI Municipal Framework',
        desc: 'Platform usage guidelines, disclaimer of liability, and municipal sanitation compliance standards.',
        slug: '/terms'
      },
      privacy: {
        title: 'Privacy Policy & Data Protection — EcoSort AI',
        desc: 'Local-first processing standards, image privacy protocols, and adherence to municipal data protection principles.',
        slug: '/privacy'
      },
      'not-found': {
        title: '404 Sorting Stream Diverted — EcoSort AI',
        desc: 'The requested page or route could not be found in the EcoSort municipal waste management system.',
        slug: '/404'
      }
    };

    const target = metaMap[tab] || metaMap.scan;
    document.title = target.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', target.desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', target.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', target.desc);

    const canonicalLink = document.getElementById('canonical-url');
    if (canonicalLink) {
      const origin = window.location.origin;
      canonicalLink.setAttribute('href', `${origin}${target.slug === '/scan' ? '/' : target.slug}`);
    }
  };

  const changeTab = (tab: AppTab) => {
    setActiveTab(tab);
    updateSeoMetadata(tab);
    if (tab === 'scan') {
      window.history.replaceState(null, '', '#scan');
    } else if (tab === 'terms') {
      window.history.replaceState(null, '', '#terms');
    } else if (tab === 'privacy') {
      window.history.replaceState(null, '', '#privacy');
    } else if (tab === 'not-found') {
      window.history.replaceState(null, '', '#404');
    } else {
      window.history.replaceState(null, '', `#${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const headers: Record<string, string> = {};
      if (user) headers['x-user-id'] = user.id;

      const res = await fetch('/api/history', { headers });
      if (res.ok) {
        const data = await res.json();
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Handle Scan Action
  const handleScan = async (inputType: 'image' | 'text', inputData: string) => {
    setIsLoading(true);
    setCurrentResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (user) headers['x-user-id'] = user.id;

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputType,
          inputData,
          municipality
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze item.');
      }

      const result: ScanResultResponse = await res.json();
      setCurrentResult(result);

      // Update user state if logged in
      if (user) {
        const updatedUser: User = {
          ...user,
          points: result.totalPoints,
          streak: result.currentStreak
        };
        setUser(updatedUser);
        localStorage.setItem('ecosort_user', JSON.stringify(updatedUser));
      }

      // Prepend to history & refresh stats
      setScans((prev) => [result.record, ...prev]);
      fetchStats();
      showToast(`Item classified as ${result.record.aiCategory.toUpperCase()} (+${result.pointsEarned} pts)`, 'success');
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast(err.message || 'Error occurred while classifying item.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Rules Handlers
  const handleAddRule = async (newRule: Omit<WasteRule, 'id' | 'updatedAt'>) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) headers['x-user-id'] = user.id;

      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers,
        body: JSON.stringify(newRule)
      });
      if (!res.ok) throw new Error('Failed to create rule');
      const data = await res.json();
      setRules((prev) => [data.rule, ...prev]);
      showToast('Municipal waste rule created successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error adding rule.', 'error');
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<WasteRule>) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) headers['x-user-id'] = user.id;

      const res = await fetch(`/api/admin/rules/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update rule');
      const data = await res.json();
      setRules((prev) => prev.map((r) => (r.id === id ? data.rule : r)));
      showToast('Rule updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating rule.', 'error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (user) headers['x-user-id'] = user.id;

      const res = await fetch(`/api/admin/rules/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete rule');
      setRules((prev) => prev.filter((r) => r.id !== id));
      showToast('Rule deleted from knowledge base.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error deleting rule.', 'error');
    }
  };

  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/admin/rules/reset-seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset seed');
      await fetchRules();
      showToast('Knowledge base reset to seed catalog of 28 municipal rules.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error resetting rules.', 'error');
    }
  };

  const handleDeleteScan = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (user) headers['x-user-id'] = user.id;

      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete scan record');
      setScans((prev) => prev.filter((s) => s.id !== id));
      showToast('Scan record removed.', 'info');
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Error deleting record.', 'error');
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('ecosort_user', JSON.stringify(loggedInUser));
    showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
    fetchHistory();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ecosort_user');
    showToast('Signed out of EcoSort.', 'info');
    fetchHistory();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-800'
              : toastMessage.type === 'error'
              ? 'bg-red-900 text-white border-red-800'
              : 'bg-stone-900 text-white border-stone-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        user={user}
        municipality={municipality}
        setMunicipality={setMunicipality}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Sub-Header Mission Bar */}
      <div className="bg-white border-b border-[#E0E7E0] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#52796F]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-[#1B4332] bg-[#D8F3DC] px-2.5 py-0.5 rounded-full border border-[#B7E4C7] shrink-0">
              <Leaf className="w-3 h-3 text-[#2D6A4F]" />
              SDG 11 & SDG 12
            </span>
            <span className="hidden md:inline text-[#B7E4C7]">•</span>
            <span className="hidden md:inline font-semibold text-[#1B4332]">
              Sustainable Cities & Responsible Consumption
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#52796F]">
            <span>
              <strong className="text-[#1B4332]">{rules.length}</strong> Municipal RAG Rules
            </span>
            <span>•</span>
            <span>
              <strong className="text-[#1B4332]">{stats?.totalScans || scans.length}</strong> Verified Segregations
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsDropOffModalOpen(true)}
              className="inline-flex items-center gap-1 font-bold text-[#2D6A4F] hover:text-[#1B4332] underline decoration-dotted cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              <span>Municipal Depots</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="inline-flex items-center gap-1 font-bold text-[#2D6A4F] hover:text-[#1B4332] underline decoration-dotted cursor-pointer"
            >
              <Award className="w-3 h-3 text-[#2D6A4F]" />
              <span>Citizen Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scan' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* If a result exists, show ResultCard first, with option to scan another */}
            {currentResult ? (
              <ResultCard
                result={currentResult}
                onScanAnother={() => setCurrentResult(null)}
                onViewHistory={() => setActiveTab('history')}
                onOpenDropOff={() => setIsDropOffModalOpen(true)}
                onBonusPoints={handleBonusPoints}
              />
            ) : (
              <ScanUploader
                onScan={handleScan}
                isLoading={isLoading}
                municipality={municipality}
                initialText={quickSearchText}
              />
            )}

            {/* Quick Municipal Guidance Helper Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#E0E7E0] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9] flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-[#1B4332] text-sm">Rinse Rigid Recyclables</h4>
                  <p className="text-[#52796F] mt-1 leading-relaxed">
                    Food remnants spoil baled paper and cardboard shipments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF3E0] text-[#EF6C00] border border-[#FFE0B2] flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-[#1B4332] text-sm">Never Bin Batteries</h4>
                  <p className="text-[#52796F] mt-1 leading-relaxed">
                    Lithium puncture creates severe flash fires in compactor trucks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7] flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-[#1B4332] text-sm">Separate Wet Organics</h4>
                  <p className="text-[#52796F] mt-1 leading-relaxed">
                    Diverts methane emission; converts into fertile organic compost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <HistoryTable
              scans={scans}
              onDeleteScan={handleDeleteScan}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-6xl mx-auto">
            <AdminRulesPanel
              rules={rules}
              onAddRule={handleAddRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              onResetSeed={handleResetSeed}
            />
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="max-w-5xl mx-auto">
            <StreakStatsBanner
              user={user}
              stats={stats}
              onOpenCertificate={() => setIsCertModalOpen(true)}
              onOpenDropOff={() => setIsDropOffModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'deliverable' && (
          <DeliverableModal />
        )}

        {activeTab === 'terms' && (
          <div className="max-w-5xl mx-auto">
            <LegalPoliciesView
              initialTab="terms"
              onBackToScan={() => changeTab('scan')}
            />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="max-w-5xl mx-auto">
            <LegalPoliciesView
              initialTab="privacy"
              onBackToScan={() => changeTab('scan')}
            />
          </div>
        )}

        {activeTab === 'not-found' && (
          <NotFoundPage
            currentPath={detectedNotFoundPath || '/unknown-route'}
            onNavigate={(target) => changeTab(target)}
            onQuickSearch={(query) => {
              setQuickSearchText(query);
              setCurrentResult(null);
              changeTab('scan');
            }}
            onOpenDropOff={() => setIsDropOffModalOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Municipal Drop-off Depots & SAFE Centers Directory Modal */}
      <DropOffLocatorModal
        isOpen={isDropOffModalOpen}
        onClose={() => setIsDropOffModalOpen(false)}
        defaultMunicipality={municipality}
        defaultCategory={currentResult?.record.aiCategory}
      />

      {/* Official Verified SDG 11 & 12 Eco-Citizen Impact Certificate */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        user={user}
        stats={stats}
      />

      {/* Comprehensive Municipal Footer with Legal & 404 Links */}
      <footer className="border-t border-[#E0E7E0] bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1B4332] text-sm sm:text-base font-['Space_Grotesk']">EcoSort AI</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
                    Municipal Standard
                  </span>
                </div>
                <p className="text-xs text-[#52796F]">
                  Advancing UN SDG 11 (Sustainable Cities) & SDG 12 (Responsible Consumption & Production)
                </p>
              </div>
            </div>

            {/* Quick Municipal Status Pill */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4332] bg-[#F7F9F6] border border-[#E0E7E0] px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
              <span>RAG Engine Active</span>
              <span className="text-[#E0E7E0]">•</span>
              <span className="text-[#52796F]">{rules.length} Local Bylaws</span>
            </div>
          </div>

          {/* Navigational & Legal Links Bar */}
          <div className="pt-4 border-t border-[#F0F4EF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52796F]">
            <nav aria-label="Footer navigation" className="flex items-center flex-wrap justify-center sm:justify-start gap-4 font-semibold">
              <a
                href="#terms"
                id="footer-terms-btn"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('terms');
                }}
                className="hover:text-[#1B4332] transition-colors cursor-pointer"
              >
                Terms & Conditions
              </a>
              <span className="text-[#E0E7E0]">•</span>
              <a
                href="#privacy"
                id="footer-privacy-btn"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('privacy');
                }}
                className="hover:text-[#1B4332] transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <span className="text-[#E0E7E0]">•</span>
              <a
                href="#404"
                id="footer-404-btn"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('not-found');
                }}
                className="text-[#52796F] hover:text-[#C0392B] transition-colors cursor-pointer flex items-center gap-1"
                title="View custom 404 error page"
              >
                <span>404 Error Page</span>
              </a>
              <span className="text-[#E0E7E0]">•</span>
              <a
                href="#deliverable"
                id="footer-deliverable-btn"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('deliverable');
                }}
                className="text-[#2D6A4F] hover:text-[#1B4332] transition-colors cursor-pointer font-bold"
              >
                Responsible AI Brief
              </a>
            </nav>

            <div className="text-[11px] text-[#52796F] text-center sm:text-right">
              © {new Date().getFullYear()} EcoSort AI • Advisory only; municipal sanitation bylaws take legal precedence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
