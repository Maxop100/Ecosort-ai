import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Terminal,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface MongoStatus {
  configured: boolean;
  connected: boolean;
  state: 'connected' | 'connecting' | 'disconnected' | 'placeholder_detected' | 'not_configured' | 'error';
  message: string;
  maskedUri?: string;
  clusterHost?: string;
  databaseName?: string;
  ruleCount?: number;
  userCount?: number;
  scanCount?: number;
  lastError?: string;
  advice?: string[];
}

export const MongoDbSetupCard: React.FC = () => {
  const [status, setStatus] = useState<MongoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [testUri, setTestUri] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Connection String Builder helper state
  const [builderUser, setBuilderUser] = useState('ecosort_admin');
  const [builderPass, setBuilderPass] = useState('');
  const [builderHost, setBuilderHost] = useState('cluster0.abcde.mongodb.net');
  const [builderDb, setBuilderDb] = useState('ecosort');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/mongodb/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    } catch (e) {
      console.error('Failed to fetch mongo status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch('/api/admin/mongodb/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: testUri.trim() || undefined })
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        fetchStatus();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to trigger connection test'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSeedMongo = async () => {
    try {
      setSeeding(true);
      setSeedResult(null);
      const res = await fetch('/api/admin/mongodb/seed', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.error) {
        setSeedResult(`Seeding error: ${data.error}`);
      } else {
        setSeedResult(`🎉 Successfully seeded ${data.count} rules into MongoDB!`);
        fetchStatus();
      }
    } catch (err: any) {
      setSeedResult(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const generatedUri = `mongodb+srv://${encodeURIComponent(builderUser || 'username')}:${encodeURIComponent(builderPass || 'password')}@${builderHost || 'cluster0.mongodb.net'}/${builderDb || 'ecosort'}?retryWrites=true&w=majority`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 md:p-6 mb-8 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900">MongoDB Atlas Database Integration</h3>
              {/* Status Badge */}
              {loading ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 animate-pulse">
                  Checking...
                </span>
              ) : status?.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected to MongoDB
                </span>
              ) : status?.state === 'placeholder_detected' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Placeholder in URI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                  <Database className="w-3.5 h-3.5" />
                  Embedded Fallback Active
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {status?.connected
                ? `Active Cluster: ${status.clusterHost || 'Atlas Cloud'} • Database: ${status.databaseName || 'ecosort'}`
                : 'Connect your cloud MongoDB Atlas database for multi-user persistence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {isGuideOpen ? 'Hide Setup Assistant' : 'MongoDB Setup Assistant'}
            {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Main Status Information */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
          <span className="text-stone-500 block mb-1 font-medium">Persistence Mode</span>
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            {status?.connected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                MongoDB Atlas Cloud
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Local Resilient Storage (Zero Downtime)
              </>
            )}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
          <span className="text-stone-500 block mb-1 font-medium">MongoDB Rules Synced</span>
          <span className="font-semibold text-stone-800">
            {status?.connected ? `${status.ruleCount ?? 0} rules in collection` : 'Ready to seed'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
          <span className="text-stone-500 block mb-1 font-medium">Quick Action</span>
          {status?.connected ? (
            <button
              onClick={handleSeedMongo}
              disabled={seeding}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {seeding ? 'Seeding...' : 'Re-sync 31 rules to MongoDB'}
            </button>
          ) : (
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" />
              Get & Configure URI
            </button>
          )}
        </div>
      </div>

      {/* Seed Result Alert */}
      {seedResult && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
          {seedResult}
        </div>
      )}

      {/* Expandable Setup Assistant */}
      {isGuideOpen && (
        <div className="mt-5 pt-5 border-t border-stone-200 text-stone-700">
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 mb-6">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Interactive MongoDB URI Generator & Helper
            </h4>
            <p className="text-xs text-emerald-800 mb-3">
              Fill in your MongoDB Atlas details below to construct a clean, URL-safe connection string automatically:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Database User</label>
                <input
                  type="text"
                  value={builderUser}
                  onChange={(e) => setBuilderUser(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Password</label>
                <input
                  type="password"
                  value={builderPass}
                  onChange={(e) => setBuilderPass(e.target.value)}
                  placeholder="Your password"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Cluster Host</label>
                <input
                  type="text"
                  value={builderHost}
                  onChange={(e) => setBuilderHost(e.target.value)}
                  placeholder="cluster0.xxxx.mongodb.net"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Database Name</label>
                <input
                  type="text"
                  value={builderDb}
                  onChange={(e) => setBuilderDb(e.target.value)}
                  placeholder="ecosort"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Generated Output */}
            <div className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <code className="text-xs text-stone-800 break-all select-all font-mono">
                {generatedUri}
              </code>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedUri)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy URI'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestUri(generatedUri);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Fill in Tester
                </button>
              </div>
            </div>
          </div>

          {/* Step by Step Checklist */}
          <div className="space-y-4 text-xs">
            <h4 className="font-semibold text-stone-900 text-sm">Follow These 3 Steps to Set Up MongoDB Atlas:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 font-bold text-stone-900 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  Create Free Cluster
                </div>
                <p className="text-stone-600 text-[11px] mb-2 leading-relaxed">
                  Go to MongoDB Atlas and select the free <strong>M0 Shared tier</strong> (512MB free storage).
                </p>
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-medium hover:underline text-[11px]"
                >
                  Visit cloud.mongodb.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 font-bold text-stone-900 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Network Access 0.0.0.0/0
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  In Atlas sidebar under <strong>Security → Network Access</strong>, click <em>Add IP Address</em> and choose <strong>Allow Access from Anywhere (0.0.0.0/0)</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 font-bold text-stone-900 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Create Database User
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Under <strong>Database Access</strong>, create a user with read/write permissions. Avoid <code>@</code> and <code>:</code> in your password.
                </p>
              </div>
            </div>

            {/* Test Connection Form */}
            <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <label className="block font-semibold text-stone-900 text-xs mb-1">
                Test Connection String Live:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testUri}
                  onChange={(e) => setTestUri(e.target.value)}
                  placeholder="mongodb+srv://user:password@cluster0.xxx.mongodb.net/ecosort?retryWrites=true&w=majority"
                  className="flex-1 text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-3 p-3 rounded-lg text-xs ${
                    testResult.success
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    {testResult.message}
                  </div>
                  {testResult.details?.hint && (
                    <p className="mt-1 text-stone-700 bg-white/70 p-2 rounded border border-stone-200 font-sans">
                      💡 <strong>Fix:</strong> {testResult.details.hint}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
