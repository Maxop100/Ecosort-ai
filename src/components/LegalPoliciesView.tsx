import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  AlertTriangle,
  Scale,
  Printer,
  Search,
  ExternalLink,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Building2,
  Leaf
} from 'lucide-react';

interface LegalPoliciesViewProps {
  initialTab?: 'terms' | 'privacy';
  onBackToScan: () => void;
}

export const LegalPoliciesView: React.FC<LegalPoliciesViewProps> = ({
  initialTab = 'terms',
  onBackToScan
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const lastUpdated = 'March 1, 2026';
  const effectiveDate = 'March 15, 2026';
  const version = 'v2.4 (Municipal AI Standard)';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E7E0] pb-5">
        <div>
          <button
            type="button"
            onClick={onBackToScan}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Waste Scanner</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1B4332] font-['Space_Grotesk'] tracking-tight">
              Legal & Compliance Framework
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D8F3DC] text-[#1B4332] border border-[#B7E4C7]">
              {version}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#52796F] mt-1 max-w-2xl">
            Official legal documentation governing AI-assisted municipal waste segregation, computer vision analysis, user data privacy, and circular upcycling standards.
          </p>
        </div>

        {/* Print & Export Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0FFF4] text-[#1B4332] border border-[#E0E7E0] hover:border-[#B7E4C7] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Print Policy</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 sm:p-3 rounded-2xl border border-[#E0E7E0] shadow-2xs">
        <div className="flex rounded-xl bg-[#F0F4EF] p-1 border border-[#E0E7E0] shrink-0">
          <button
            type="button"
            id="tab-terms-btn"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#52796F] hover:text-[#1B4332]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Terms & Conditions</span>
          </button>

          <button
            type="button"
            id="tab-privacy-btn"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#52796F] hover:text-[#1B4332]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Quick Search within Clauses */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52796F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses (e.g., camera, AI accuracy, liability, cookies)..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F9F6] border border-[#E0E7E0] rounded-xl text-xs text-[#1B4332] placeholder:text-[#52796F]/70 focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Metadata Overview Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#E0E7E0] flex items-center gap-3">
          <Calendar className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <div className="text-xs">
            <span className="text-[#52796F] block">Last Revised</span>
            <span className="font-bold text-[#1B4332]">{lastUpdated}</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E0E7E0] flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <div className="text-xs">
            <span className="text-[#52796F] block">Jurisdiction Standard</span>
            <span className="font-bold text-[#1B4332]">Municipal Public Works & UN SDG 11/12</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#E0E7E0] flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <div className="text-xs">
            <span className="text-[#52796F] block">AI Ethics Audit</span>
            <span className="font-bold text-[#1B4332]">ISO/IEC 42001 AI Conformant</span>
          </div>
        </div>
      </div>

      {/* Main Legal Content */}
      {activeTab === 'terms' ? (
        <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-10 space-y-8 text-sm text-[#334155] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 01
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Acceptance of Terms and Scope of Service
              </h2>
            </div>
            <p>
              By accessing, browsing, or utilizing the <strong>EcoSort AI</strong> platform (including its text classifier, computer vision scanner, municipal rule engine, and upcycling studio), you agree to be bound by these Terms and Conditions and all applicable municipal, state, national, and international environmental waste management regulations.
            </p>
            <p>
              EcoSort AI provides automated waste identification and sorting recommendations aligned with United Nations Sustainable Development Goals (SDG 11: Sustainable Cities & Communities and SDG 12: Responsible Consumption & Production). If you do not agree to these terms, you must refrain from using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 02
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Artificial Intelligence Advisory Disclaimer & Municipal Precedence
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Critical Municipal Compliance Notice</span>
              </div>
              <p>
                EcoSort utilizes advanced multimodal artificial intelligence (Google Gemini API) and Retrieval-Augmented Generation (RAG) to determine material classifications. While our models are continually calibrated against official municipal datasets, <strong>all recommendations are advisory in nature</strong>.
              </p>
              <p>
                <strong>Local municipal bylaws, regional sanitation ordinances, and official physical bin labeling always take legal precedence</strong> over artificial intelligence outputs. The user remains solely responsible for verifying that materials placed into curbside collections adhere to local city laws.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 03
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Hazardous Materials, E-Waste & Prohibited Disposals
              </h2>
            </div>
            <p>
              The platform strictly advises against placing hazardous household wastes (including but not limited to lithium-ion batteries, liquid mercury, industrial solvents, medical sharps, ammunition, and pressurized gas cylinders) into general curbside recycling or landfill streams.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Users must consult the <strong>Municipal Drop-Off Depots directory</strong> within the application to locate certified SAFE Centers.</li>
              <li>Lithium battery terminals must be securely taped with non-conductive electrical or clear scotch tape prior to transit.</li>
              <li>EcoSort AI assumes no liability for thermal runaway, chemical contamination, or fines resulting from illicit curbside bin deposits.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 04
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Upcycling & DIY Craft Safety Notice
              </h2>
            </div>
            <p>
              The <strong>AI Upcycle Studio</strong> provides automated DIY suggestions to repurpose discarded packaging and items. Users executing DIY projects do so at their own discretion and risk:
            </p>
            <p className="text-xs sm:text-sm text-[#52796F]">
              Always wear appropriate personal protective equipment (safety goggles, cut-resistant gloves) when cutting metals or glass. Ensure tools are handled safely and keep sharp edges, toxic glues, or chemical paints out of the reach of unsupervised minors.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 05
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Gamification, Eco-Points & Certificate Authenticity
              </h2>
            </div>
            <p>
              EcoSort points, streaks, badges, and the <em>Verified SDG 11 & 12 Eco-Citizen Certificate</em> represent educational achievements and community recognition. They do not possess monetary, cash, or credit value. EcoSort reserves the right to adjust point balancing or audit automated streak counts to prevent artificial system manipulation.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 06
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Limitation of Liability & Indemnification
              </h2>
            </div>
            <p>
              To the fullest extent permitted by applicable law, EcoSort and its developers, municipal partners, and affiliates shall not be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from the use or inability to use this service, including municipal sorting fines, equipment damage, or personal injury during waste handling.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2.5 border-t border-[#E0E7E0] pt-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Section 07
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Modifications to Terms & Inquiries
              </h2>
            </div>
            <p>
              We reserve the right to revise these Terms at any time to reflect updates in waste legislation or AI model capabilities. For legal inquiries, please contact our municipal advisory liaison at <code className="bg-[#F0F4EF] px-2 py-0.5 rounded text-[#1B4332] font-semibold">legal@ecosort.org</code>.
            </p>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-10 space-y-8 text-sm text-[#334155] leading-relaxed">
          {/* Privacy Intro */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Policy 01
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Our Commitment to Privacy & Environmental Transparency
              </h2>
            </div>
            <p>
              At <strong>EcoSort AI</strong>, your privacy is fundamental. We design our software with privacy-by-design principles adhering to the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and ethical AI principles.
            </p>
            <p>
              Our sole mission is promoting waste diversion and circular habits—<strong>we never sell, rent, or monetize your personal information or uploaded imagery</strong>.
            </p>
          </section>

          {/* Policy 02: Image Processing */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Policy 02
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Camera & Image Data: Ephemeral Processing
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0FFF4] border border-[#B7E4C7] text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#1B4332]">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Zero Facial Recognition & Ephemeral Camera Streams</span>
              </div>
              <p className="text-[#2D6A4F]">
                When you grant camera permissions or upload photos of waste items:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#2D6A4F]">
                <li>Images are transmitted securely via TLS 1.3 encryption directly to the server-side Gemini Vision API exclusively for object detection and packaging material inference.</li>
                <li><strong>No private facial recognition or biometric analysis</strong> is conducted. Any detected human faces or incidental background elements are discarded.</li>
                <li>Images are processed ephemerally in volatile memory; they are <strong>never permanently archived</strong> on public cloud storage or sold to third-party advertising networks.</li>
              </ul>
            </div>
          </section>

          {/* Policy 03: Information Collected */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Policy 03
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Types of Information Processed
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] space-y-1.5">
                <span className="font-bold text-[#1B4332] block">1. User Inputs & Scan Data</span>
                <p className="text-[#52796F]">
                  Text search descriptions, item category predictions, confidence scores, and timestamps stored locally on your device for your personal scan history audit log.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] space-y-1.5">
                <span className="font-bold text-[#1B4332] block">2. Regional Settings</span>
                <p className="text-[#52796F]">
                  Selected municipal rule profiles (e.g. San Francisco Zero Waste, London Boroughs, or Bengaluru BBMP) used solely to supply localized sorting bylaws.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] space-y-1.5">
                <span className="font-bold text-[#1B4332] block">3. Streak & Gamification Stats</span>
                <p className="text-[#52796F]">
                  Daily streak counter, Eco-Points balance, and completed DIY upcycle count stored in your browser's local sandbox (`localStorage`).
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] space-y-1.5">
                <span className="font-bold text-[#1B4332] block">4. Aggregated City Metrics</span>
                <p className="text-[#52796F]">
                  Anonymized item counts (e.g., "120 aluminum cans recycled") combined to compute municipal-level landfill diversion and CO₂ offset milestones.
                </p>
              </div>
            </div>
          </section>

          {/* Policy 04: Local Storage & Cookies */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Policy 04
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Client-Side Storage & Cookie Usage
              </h2>
            </div>
            <p>
              EcoSort operates primarily offline-first using standard HTML5 <code className="bg-[#F0F4EF] px-1.5 py-0.5 rounded text-[#1B4332] font-semibold text-xs">localStorage</code> to remember your active profile, streaks, and historical audit entries. We do not use third-party behavioral advertising trackers, invasive pixel tags, or cross-site fingerprinting scripts.
            </p>
            <p className="text-xs text-[#52796F]">
              You can instantly purge all locally retained records at any time by navigating to the <strong>Audit History</strong> tab and clicking <em>"Clear History"</em> or by clearing your browser cache.
            </p>
          </section>

          {/* Policy 05: User Rights */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Policy 05
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Your Legal Rights (GDPR & CCPA)
              </h2>
            </div>
            <p>Under international data protection frameworks, you have the absolute right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Right to Access & Portability:</strong> View and export all personal classification records and certificate data.</li>
              <li><strong>Right to Erasure ("Right to Be Forgotten"):</strong> Delete your local profile, streak records, and verification credentials immediately.</li>
              <li><strong>Right to Restrict Processing:</strong> Disable camera input and utilize pure text search for total visual privacy.</li>
              <li><strong>Right to Non-Discrimination:</strong> Enjoy full access to all waste classification features without requiring account creation.</li>
            </ul>
          </section>

          {/* Policy 06: Contact */}
          <section className="space-y-2.5 border-t border-[#E0E7E0] pt-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#2D6A4F] font-bold text-xs">
                Policy 06
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B4332] font-['Space_Grotesk']">
                Data Protection Officer & Inquiries
              </h2>
            </div>
            <p>
              If you have any questions regarding our environmental data practices, algorithmic transparency, or data deletion requests, contact our Data Protection Officer at:
            </p>
            <div className="p-4 rounded-xl bg-[#F7F9F6] border border-[#E0E7E0] text-xs space-y-1">
              <p className="font-bold text-[#1B4332]">EcoSort AI Data Privacy & Ethics Office</p>
              <p className="text-[#52796F]">Email: <span className="font-semibold text-[#1B4332]">privacy@ecosort.org</span></p>
              <p className="text-[#52796F]">Subject Header: <span className="font-semibold text-[#1B4332]">Privacy & SDG Data Inquiries</span></p>
            </div>
          </section>
        </div>
      )}

      {/* Bottom Quick Return Bar */}
      <div className="p-5 rounded-2xl bg-[#1B4332] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] border border-[#52B788] flex items-center justify-center text-white shrink-0">
            <Leaf className="w-5 h-5 text-[#52B788]" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base font-['Space_Grotesk']">
              Ready to sort waste sustainably?
            </h4>
            <p className="text-xs text-[#D8F3DC]">
              Return to the scanner to verify items or explore municipal drop-off centers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToScan}
          className="px-5 py-2.5 rounded-xl bg-[#52B788] hover:bg-[#40916C] text-[#081C15] font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs hover:scale-[1.02]"
        >
          <span>Open AI Scanner</span>
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
