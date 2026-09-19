import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Building,
  GraduationCap,
  Globe,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Eye,
  HeartHandshake
} from 'lucide-react';

export const DeliverableModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [studentName, setStudentName] = useState('Max Operator (Intern)');
  const [collegeName, setCollegeName] = useState('Department of Computer Science & Sustainable Engineering');

  const copyDeliverableText = () => {
    const text = `
ECOSORT: AI-POWERED WASTE SEGREGATION & DISPOSAL ADVISOR
Project Brief & Internship Deliverable Submission

1. SUBMISSION DETAILS
- Project Title: EcoSort (Municipal Waste Segregation & Disposal Advisor)
- Author Name: ${studentName}
- College / University: ${collegeName}
- Target Platform: Monorepo Full-Stack (Next.js/Vite + Express + Tailwind + MongoDB/Embedded DB)

2. SUSTAINABLE DEVELOPMENT GOALS (SDG) ALIGNMENT
- SDG 11: Sustainable Cities and Communities (Target 11.6: Reduce adverse environmental impact of cities through municipal waste management).
- SDG 12: Responsible Consumption and Production (Target 12.4 & 12.5: Environmentally sound management of chemicals and wastes through prevention, reduction, recycling, and reuse).

3. PROBLEM STATEMENT
Most urban households, students, and residential welfare associations (RWAs) struggle with correct source segregation. Mixed recyclables become contaminated by food waste, toxic lithium-ion cells cause devastating fires in municipal compactor trucks, and hazardous chemicals leach into municipal groundwater. Standard static pamphlets fail because consumers do not know the exact composition of multi-layer or composite packaging.

4. AI SOLUTION OVERVIEW
EcoSort combines multimodal vision and text processing with a local knowledge base (RAG - Retrieval-Augmented Generation) to deliver immediate, verified municipal disposal instructions.
- Step 1: Multimodal Classification Prompt
  "You are a waste classification assistant. Given the item description or image, classify it into exactly one category: recyclable, organic, e-waste, hazardous, or general-waste. Respond in JSON: { 'category': '', 'confidence': 0-1, 'reasoning': '' }. Be concise and avoid assumptions not supported by the input."
- Step 2: RAG Knowledge Base Retrieval
  Matches keywords and category against a municipal knowledge base with 28+ municipal rules (supporting San Francisco, London, Bengaluru, and General standards).
- Step 3: RAG Disposal-Instruction Prompt
  "You are a disposal guidance assistant. Given the item category '{category}' and the retrieved municipal rule: '{retrieved_rule_text}', write a short, clear, 2-3 sentence instruction telling the user exactly how to dispose of this item. Do not invent rules not present in the retrieved text."

5. RESPONSIBLE AI CONSIDERATIONS
- Fairness: Classification is based solely on visual item properties, cleanliness, and material composition — completely blind to user identity, location wealth, or background.
- Transparency: Every classification explicitly displays the confidence score, material reasoning, and cites the specific municipal rule retrieved from the database.
- Ethics: Absolute ban on DIY handling of hazardous waste. Flammables, mercury lamps, and lithium batteries are strictly directed to certified municipal HHW / WEEE kiosks.
- Privacy: Scanned images are processed transiently for classification and history tracking; never used for unauthorized training or surveillance.

6. TARGET USERS
- Urban Households: Everyday kitchen and packaging segregation.
- University Students: Fast advice on takeout boxes, electronics, and study supplies.
- Residential Welfare Associations (RWAs): Standardizing community bin compliance and monitoring collective diversion metrics.

7. EXPECTED IMPACT STATEMENT
By increasing source segregation compliance by 35-50% in pilot communities:
- Up to 0.28 kg of CO₂ emissions avoided per recyclable item recycled.
- 0.16 kg CO₂-eq methane avoided per organic meal diverted to municipal composting.
- Elimination of compaction fire risks by intercepting lithium batteries and aerosol canisters at source.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E0E7E0] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#52B788] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
              Internship Deliverable
            </span>
            <span className="text-xs font-semibold text-[#52796F]">SDG 11 & SDG 12</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B4332] mt-2 font-['Space_Grotesk'] tracking-tight">
            EcoSort Project Brief & Responsible AI Documentation
          </h1>
          <p className="text-xs sm:text-sm text-[#52796F] mt-1 font-medium">
            Formal submission overview, architecture flow diagram, and ethical AI safeguards.
          </p>
        </div>

        <button
          id="copy-brief-btn"
          onClick={copyDeliverableText}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs transition-all self-start sm:self-center cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-[#52B788]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Report Copied!' : 'Copy Submission Text'}</span>
        </button>
      </div>

      {/* Student Details Customizer */}
      <div className="bg-white rounded-3xl border border-[#E0E7E0] p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold text-[#1B4332] uppercase tracking-wider mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#2D6A4F]" />
          <span>Author & College Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-1.5">Student / Author Name:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-1.5">College / Department Name:</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
            />
          </div>
        </div>
      </div>

      {/* 4 Pillars of Responsible AI (Mandated by Brief) */}
      <div className="bg-white rounded-3xl border border-[#E0E7E0] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#2D6A4F]" />
          <h3 className="text-lg font-bold text-[#1B4332] font-['Space_Grotesk']">
            Responsible AI Considerations
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Fairness */}
          <div className="p-5 rounded-2xl border border-[#E0E7E0] bg-[#F7F9F6] space-y-2">
            <div className="flex items-center gap-2 text-[#2D6A4F] font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-[#2D6A4F]" />
              <span>1. Fairness</span>
            </div>
            <p className="text-xs text-[#52796F] leading-relaxed font-medium">
              Classification is based strictly on physical item description, visual appearance, and material condition. The AI makes zero assumptions about the user's demographic identity, geographic wealth, or residential background.
            </p>
          </div>

          {/* 2. Transparency */}
          <div className="p-5 rounded-2xl border border-[#E0E7E0] bg-[#F7F9F6] space-y-2">
            <div className="flex items-center gap-2 text-[#1B4332] font-bold text-sm">
              <Eye className="w-4 h-4 text-[#2D6A4F]" />
              <span>2. Transparency</span>
            </div>
            <p className="text-xs text-[#52796F] leading-relaxed font-medium">
              Every result provides clear reasoning behind the classification rather than an unexplained black-box label. The user can inspect the exact confidence level and the retrieved municipal rule keyword that justified the decision.
            </p>
          </div>

          {/* 3. Ethics */}
          <div className="p-5 rounded-2xl border border-[#E0E7E0] bg-[#F7F9F6] space-y-2">
            <div className="flex items-center gap-2 text-[#C0392B] font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>3. Ethics & Safety</span>
            </div>
            <p className="text-xs text-[#52796F] leading-relaxed font-medium">
              Strict prohibition against hazardous DIY instructions. For toxic chemicals, broken mercury bulbs, and lithium batteries, the app consistently redirects users to certified municipal hazardous drop-offs to prevent injuries and fires.
            </p>
          </div>

          {/* 4. Privacy */}
          <div className="p-5 rounded-2xl border border-[#E0E7E0] bg-[#F7F9F6] space-y-2">
            <div className="flex items-center gap-2 text-[#D35400] font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>4. Privacy</span>
            </div>
            <p className="text-xs text-[#52796F] leading-relaxed font-medium">
              Uploaded images are utilized solely for classification inference and user history review. Images are processed in transient container memory and are never harvested for biometric profiling or third-party ad tracking.
            </p>
          </div>
        </div>
      </div>

      {/* AI Solution Flow Diagram */}
      <div className="bg-white rounded-3xl border border-[#E0E7E0] p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-[#1B4332] font-['Space_Grotesk'] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2D6A4F]" />
          <span>Architecture & RAG Flow Diagram</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] relative">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs mb-2.5 shadow-xs">
              1
            </div>
            <h4 className="font-bold text-xs text-[#1B4332]">Item Scan Input</h4>
            <p className="text-[11px] text-[#52796F] mt-1 font-medium">
              User provides webcam photo, file upload, or natural language text query.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] relative">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs mb-2.5 shadow-xs">
              2
            </div>
            <h4 className="font-bold text-xs text-[#1B4332]">Multimodal AI</h4>
            <p className="text-[11px] text-[#52796F] mt-1 font-medium">
              Classifies into 1 of 5 streams with confidence level and reasoning.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] relative">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs mb-2.5 shadow-xs">
              3
            </div>
            <h4 className="font-bold text-xs text-[#1B4332]">RAG Rule Matching</h4>
            <p className="text-[11px] text-[#52796F] mt-1 font-medium">
              Queries 28+ municipal rules to pull official bin protocols (prevents hardcoding).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F9F6] border border-[#E0E7E0] relative">
            <div className="w-8 h-8 mx-auto rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs mb-2.5 shadow-xs">
              4
            </div>
            <h4 className="font-bold text-xs text-[#1B4332]">Guidance & Gamification</h4>
            <p className="text-[11px] text-[#52796F] mt-1 font-medium">
              Generates 2-3 sentence actionable guide, awards eco points, and updates daily streak.
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Templates Display */}
      <div className="bg-white rounded-3xl border border-[#E0E7E0] p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-[#1B4332] font-['Space_Grotesk'] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#2D6A4F]" />
          <span>Implemented Prompt Templates</span>
        </h3>

        <div className="space-y-3.5">
          <div className="p-5 rounded-2xl bg-[#1B4332] text-white font-mono text-xs border border-[#2D6A4F] shadow-xs">
            <div className="text-[#52B788] font-bold mb-1.5">
              // Prompt 1: Multimodal Classification Prompt
            </div>
            <p className="text-[#D8F3DC] leading-relaxed">
              You are a waste classification assistant. Given the item description or image, classify it into exactly one category: recyclable, organic, e-waste, hazardous, or general-waste. Respond in JSON: &#123; "category": "", "confidence": 0-1, "reasoning": "" &#125;. Be concise and avoid assumptions not supported by the input.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1B4332] text-white font-mono text-xs border border-[#2D6A4F] shadow-xs">
            <div className="text-[#52B788] font-bold mb-1.5">
              // Prompt 2: RAG Municipal Disposal Instruction Prompt
            </div>
            <p className="text-[#D8F3DC] leading-relaxed">
              You are a disposal guidance assistant. Given the item category "&#123;category&#125;" and the retrieved municipal rule: "&#123;retrieved_rule_text&#125;", write a short, clear, 2-3 sentence instruction telling the user exactly how to dispose of this item. Do not invent rules not present in the retrieved text.
            </p>
          </div>
        </div>
      </div>

      {/* Expected Impact Statement */}
      <div className="bg-[#1B4332] rounded-3xl text-white p-6 sm:p-8 shadow-sm border border-[#2D6A4F] relative overflow-hidden">
        {/* Subtle decorative geometric circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#40916C] rounded-full opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-[#52B788]" />
            <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
              Expected Environmental & Social Impact
            </h3>
          </div>
          <p className="text-[#D8F3DC] text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            By decentralizing accurate segregation knowledge to households and RWAs, EcoSort addresses the root cause of recycling contamination (often exceeding 25% in urban facilities). Intercepting hazardous lithium batteries eliminates fires in compaction trucks, while diverting organic food scraps reduces methane emissions at municipal landfills in direct alignment with UN Sustainable Development Goals 11.6 and 12.5.
          </p>
        </div>
      </div>
    </div>
  );
};
