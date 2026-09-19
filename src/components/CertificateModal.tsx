import React, { useRef, useState } from 'react';
import { Award, Download, Printer, X, ShieldCheck, Sparkles, Leaf, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, SystemStats } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  stats: SystemStats | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, user, stats }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const userName = user?.name || 'EcoSort Community Citizen';
  const streak = user?.streak || 4;
  const userPoints = user?.points || 85;
  const co2Avoided = ((userPoints * 0.15) || 12.8).toFixed(1);
  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const verificationHash = `ECO-SDG-${(user?.id || 'demo').slice(0, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    setIsGenerating(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });

    // We can draw the certificate directly on an HTML5 canvas and export as PNG
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(1, '#F4FAF6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 800);

      // 2. Outer & Inner Borders
      ctx.strokeStyle = '#2D6A4F';
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, 1160, 760);

      ctx.strokeStyle = '#B7E4C7';
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, 1128, 728);

      // 3. Header title
      ctx.fillStyle = '#1B4332';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('UNITED NATIONS SUSTAINABLE DEVELOPMENT GOALS 11 & 12', 600, 110);

      ctx.fillStyle = '#52B788';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('CIRCULAR ECONOMY & MUNICIPAL WASTE SEGREGATION STANDARD', 600, 140);

      ctx.fillStyle = '#1B4332';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('Certificate of Environmental Stewardship', 600, 210);

      ctx.fillStyle = '#52796F';
      ctx.font = '18px sans-serif';
      ctx.fillText('This official credential certifies that', 600, 260);

      // 4. User Name
      ctx.fillStyle = '#1B4332';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(userName, 600, 320);

      // Underline for name
      ctx.strokeStyle = '#52B788';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(350, 335);
      ctx.lineTo(850, 335);
      ctx.stroke();

      // Description text
      ctx.fillStyle = '#334155';
      ctx.font = '16px sans-serif';
      ctx.fillText(
        'has demonstrated verified compliance with municipal waste segregation protocols, active landfill diversion,',
        600,
        380
      );
      ctx.fillText(
        'and circular economy practices under the EcoSort AI municipal classification framework.',
        600,
        410
      );

      // 5. Impact Metrics Box
      ctx.fillStyle = '#E8F5E9';
      ctx.beginPath();
      ctx.roundRect(250, 450, 700, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#C8E6C9';
      ctx.stroke();

      ctx.fillStyle = '#1B4332';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`${streak} Days`, 360, 495);
      ctx.fillText(`${co2Avoided} kg`, 600, 495);
      ctx.fillText(`${userPoints} Pts`, 840, 495);

      ctx.fillStyle = '#52796F';
      ctx.font = '13px sans-serif';
      ctx.fillText('Active Streak', 360, 525);
      ctx.fillText('CO₂ Avoided', 600, 525);
      ctx.fillText('Eco Points Earned', 840, 525);

      // 6. Signatures & Date
      ctx.textAlign = 'left';
      ctx.fillStyle = '#52796F';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Issued: ${issueDate}`, 120, 680);
      ctx.fillText(`Verification: ${verificationHash}`, 120, 705);

      ctx.textAlign = 'right';
      ctx.fillText('EcoSort AI Municipal Board', 1080, 680);
      ctx.fillStyle = '#1B4332';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('Verified Circular Citizen', 1080, 705);

      // Download link trigger
      const link = document.createElement('a');
      link.download = `EcoSort-Certificate-${userName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E0E7E0] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#52B788]" />
            <div>
              <h3 className="font-bold text-base sm:text-lg font-['Space_Grotesk']">
                Official Eco-Citizen Impact Certificate
              </h3>
              <p className="text-xs text-[#D8F3DC]">SDG 11 & SDG 12 Verified Environmental Milestone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#D8F3DC] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Preview Display */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-100/60 flex items-center justify-center">
          <div
            ref={certRef}
            className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-[#2D6A4F] shadow-md relative w-full text-center space-y-4"
            style={{
              backgroundImage: 'radial-gradient(#E8F5E9 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Top Seal */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs border-2 border-[#52B788]">
              <Leaf className="w-7 h-7 text-[#52B788]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D6A4F] block">
                United Nations SDG 11 & 12 Endorsement
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-[#1B4332] font-['Space_Grotesk'] tracking-tight">
                Certificate of Environmental Stewardship
              </h4>
              <p className="text-xs text-[#52796F]">This credential certifies that</p>
            </div>

            {/* Name */}
            <div className="py-1 border-b-2 border-[#52B788] max-w-sm mx-auto">
              <span className="text-xl sm:text-2xl font-bold text-[#1B4332] tracking-wide">{userName}</span>
            </div>

            <p className="text-xs text-[#52796F] max-w-md mx-auto leading-relaxed">
              has maintained consistent municipal waste segregation, active landfill reduction, and circular economy
              practices verified by the EcoSort AI advisory system.
            </p>

            {/* Metrics Triad */}
            <div className="grid grid-cols-3 gap-2 bg-[#F0FFF4] p-3.5 rounded-xl border border-[#B7E4C7] max-w-md mx-auto text-center">
              <div>
                <div className="text-base sm:text-lg font-bold text-[#1B4332]">{streak} Days</div>
                <div className="text-[10px] text-[#52796F] uppercase font-bold">Active Streak</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-[#2D6A4F]">{co2Avoided} kg</div>
                <div className="text-[10px] text-[#52796F] uppercase font-bold">CO₂ Diverted</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-[#1B4332]">{userPoints} pts</div>
                <div className="text-[10px] text-[#52796F] uppercase font-bold">Eco-Score</div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-3 border-t border-[#E0E7E0] flex items-center justify-between text-[11px] text-[#52796F]">
              <div className="text-left">
                <span className="block font-semibold text-[#1B4332]">{issueDate}</span>
                <span className="text-[10px] text-[#52796F]">{verificationHash}</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-[#1B4332]">EcoSort Advisory Board</span>
                <span className="text-[10px] text-[#2D6A4F] font-semibold">Verified Eco-Citizen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-[#E0E7E0] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E0E7E0] text-xs font-semibold text-[#52796F] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-[#B7E4C7] bg-[#F0FFF4] hover:bg-[#D8F3DC] text-[#1B4332] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02]"
            >
              <Download className="w-4 h-4 text-[#52B788]" />
              <span>{isGenerating ? 'Rendering...' : 'Download Certificate (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
