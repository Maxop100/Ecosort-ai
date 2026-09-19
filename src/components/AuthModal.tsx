import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Shield, User as UserIcon, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login' ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@ecosort.org' : 'demo@ecosort.org';
      const demoPassword = role === 'admin' ? 'admin123' : 'password123';

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E0E7E0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E0E7E0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1B4332] font-['Space_Grotesk']">
                {mode === 'login' ? 'Sign In to EcoSort' : 'Create EcoSort Account'}
              </h3>
              <p className="text-[11px] text-[#52796F] font-medium">
                Save personal scan records, streaks, and community points.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#52796F] hover:text-[#1B4332] rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Buttons */}
          <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-[#E0E7E0] space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#52796F] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Test Drive:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-user-login-btn"
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#F0FFF4] border border-[#E0E7E0] hover:border-[#52B788] rounded-xl text-xs font-bold text-[#1B4332] transition-colors shadow-xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Eco Citizen (Demo)</span>
              </button>

              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#F0FFF4] border border-[#E0E7E0] hover:border-[#52B788] rounded-xl text-xs font-bold text-[#1B4332] transition-colors shadow-xs cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Municipal Admin</span>
              </button>
            </div>
            <p className="text-[10px] text-[#52796F] text-center pt-0.5">
              Preset accounts: <code className="bg-[#E0E7E0]/60 px-1 py-0.5 rounded text-[9px]">demo@ecosort.org</code> or <code className="bg-[#E0E7E0]/60 px-1 py-0.5 rounded text-[9px]">admin@ecosort.org</code>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#52796F] my-2">
            <div className="flex-1 h-px bg-[#E0E7E0]" />
            <span className="font-medium text-[11px]">or continue with credentials</span>
            <div className="flex-1 h-px bg-[#E0E7E0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name-input" className="block text-xs font-bold text-[#1B4332] mb-1">Full Name:</label>
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email-input" className="block text-xs font-bold text-[#1B4332] mb-1">Email Address:</label>
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label htmlFor="auth-password-input" className="block text-xs font-bold text-[#1B4332] mb-1">Password:</label>
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              id="auth-toggle-mode-btn"
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="text-xs text-[#2D6A4F] hover:underline font-bold cursor-pointer"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
