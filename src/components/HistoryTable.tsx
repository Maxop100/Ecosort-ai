import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { ScanRecord, WasteCategory } from '../types';

interface HistoryTableProps {
  scans: ScanRecord[];
  onDeleteScan: (id: string) => Promise<void>;
  onSelectScanForReview?: (scan: ScanRecord) => void;
}

const CATEGORY_STYLES: Record<WasteCategory, { bg: string; text: string; border: string }> = {
  recyclable: { bg: 'bg-[#E8F5E9]', text: 'text-[#2D6A4F]', border: 'border-[#C8E6C9]' },
  organic: { bg: 'bg-[#D8F3DC]', text: 'text-[#1B4332]', border: 'border-[#B7E4C7]' },
  'e-waste': { bg: 'bg-[#FFF3E0]', text: 'text-[#D35400]', border: 'border-[#FFE0B2]' },
  hazardous: { bg: 'bg-[#FDF2E9]', text: 'text-[#C0392B]', border: 'border-[#FADBD8]' },
  general: { bg: 'bg-[#F0F4EF]', text: 'text-[#52796F]', border: 'border-[#E0E7E0]' },
  'general-waste': { bg: 'bg-[#F0F4EF]', text: 'text-[#52796F]', border: 'border-[#E0E7E0]' }
};

export const HistoryTable: React.FC<HistoryTableProps> = ({ scans, onDeleteScan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalScan, setActiveModalScan] = useState<ScanRecord | null>(null);

  const filteredScans = scans.filter((scan) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      scan.aiCategory === selectedCategory ||
      (selectedCategory === 'general' && (scan.aiCategory === 'general' || scan.aiCategory === 'general-waste'));
    const matchesSearch =
      scan.inputData.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.disposalInstruction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.aiCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const exportHistoryCSV = () => {
    if (scans.length === 0) return;
    const headers = ['Timestamp', 'Category', 'Confidence', 'Item / Input', 'Disposal Instruction', 'Municipality'];
    const rows = scans.map((s) => [
      new Date(s.createdAt).toISOString(),
      s.aiCategory,
      Math.round(s.aiConfidence * 100) + '%',
      `"${s.inputData.replace(/"/g, '""').substring(0, 80)}"`,
      `"${s.disposalInstruction.replace(/"/g, '""')}"`,
      s.municipality || 'general'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecosort_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E7E0] pb-5 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332] font-['Space_Grotesk'] tracking-tight">
            Segregation History & Log
          </h1>
          <p className="text-xs sm:text-sm text-[#52796F] mt-0.5 font-medium">
            Audit of past scans with category classifications, confidence scores, and RAG rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-history-csv-btn"
            onClick={exportHistoryCSV}
            disabled={scans.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E0E7E0] bg-white hover:bg-[#F0FFF4] text-[#1B4332] text-xs font-bold disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#52796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="history-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items, keywords, or instructions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#52B788]/20 text-xs text-[#1B4332] font-medium outline-none transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'recyclable', 'organic', 'e-waste', 'hazardous', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'bg-[#F0F4EF] text-[#52796F] hover:text-[#1B4332] hover:bg-[#E0E7E0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table */}
      {filteredScans.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-[#E0E7E0] rounded-3xl bg-[#F7F9F6]">
          <FileText className="w-10 h-10 text-[#52796F]/40 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#1B4332]">No scan records found</p>
          <p className="text-xs text-[#52796F] mt-1">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try modifying your filter or search query.'
              : 'Scan your first item to build your disposal history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => {
            const style = CATEGORY_STYLES[scan.aiCategory] || CATEGORY_STYLES.general;
            const isImage = scan.inputType === 'image';

            return (
              <div
                key={scan.id}
                onClick={() => setActiveModalScan(scan)}
                className="p-4 rounded-2xl border border-[#E0E7E0] hover:border-[#52B788] hover:bg-[#F7F9F6] transition-all cursor-pointer bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Thumbnail / Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#F0F4EF] border border-[#E0E7E0] overflow-hidden flex items-center justify-center shrink-0">
                    {isImage && scan.inputData.startsWith('data:image') ? (
                      <img
                        src={scan.inputData}
                        alt={`Scanned waste item preview classified as ${scan.aiCategory || 'waste'}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">
                        {scan.aiCategory === 'recyclable'
                          ? '♻️'
                          : scan.aiCategory === 'organic'
                          ? '🍎'
                          : scan.aiCategory === 'e-waste'
                          ? '🔌'
                          : scan.aiCategory === 'hazardous'
                          ? '⚠️'
                          : '🗑️'}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {scan.aiCategory}
                      </span>
                      <span className="text-[11px] font-semibold text-[#52796F]">
                        {Math.round(scan.aiConfidence * 100)}% confidence
                      </span>
                      <span className="text-[11px] text-[#52796F]/70">
                        • {new Date(scan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[#1B4332] mt-1 truncate">
                      {isImage ? 'Visual Photo Capture' : scan.inputData}
                    </h4>

                    <p className="text-xs text-[#52796F] mt-0.5 line-clamp-1 font-medium">
                      {scan.disposalInstruction}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalScan(scan);
                    }}
                    className="px-2.5 py-1.5 text-[#2D6A4F] hover:bg-[#D8F3DC] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this scan entry from your history?')) {
                        onDeleteScan(scan.id);
                      }
                    }}
                    className="p-1.5 text-[#52796F] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {activeModalScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E0E7E0] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[#E0E7E0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    CATEGORY_STYLES[activeModalScan.aiCategory]?.bg
                  } ${CATEGORY_STYLES[activeModalScan.aiCategory]?.text} ${
                    CATEGORY_STYLES[activeModalScan.aiCategory]?.border
                  }`}
                >
                  {activeModalScan.aiCategory}
                </span>
                <span className="text-xs font-semibold text-[#52796F]">
                  {Math.round(activeModalScan.aiConfidence * 100)}% confidence
                </span>
              </div>
              <button
                onClick={() => setActiveModalScan(null)}
                className="p-1 text-[#52796F] hover:text-[#1B4332] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {activeModalScan.inputType === 'image' && activeModalScan.inputData.startsWith('data:image') && (
                <div className="rounded-2xl overflow-hidden border border-[#E0E7E0] bg-[#F7F9F6] flex justify-center max-h-60 p-2">
                  <img
                    src={activeModalScan.inputData}
                    alt={`High resolution view of scanned waste item categorized as ${activeModalScan.aiCategory || 'waste'}`}
                    loading="lazy"
                    decoding="async"
                    className="object-contain max-h-60 w-auto rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase text-[#52796F] tracking-wider">
                  Item Scanned
                </label>
                <p className="text-sm font-bold text-[#1B4332] mt-0.5">
                  {activeModalScan.inputType === 'image' ? 'Image upload scan' : activeModalScan.inputData}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0FFF4] border border-[#B7E4C7]">
                <label className="text-[11px] font-bold uppercase text-[#1B4332] tracking-wider flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  RAG Municipal Disposal Instruction
                </label>
                <p className="text-xs sm:text-sm text-[#1B4332] font-semibold leading-relaxed">
                  {activeModalScan.disposalInstruction}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[#52796F] tracking-wider">
                  AI Material Reasoning
                </label>
                <p className="text-xs text-[#1B4332] mt-0.5 leading-relaxed font-medium">
                  {activeModalScan.reasoning || 'Classified according to municipal waste segregation standards.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E0E7E0] flex items-center justify-between text-xs text-[#52796F] font-medium">
                <span>Municipality: {activeModalScan.municipality || 'General'}</span>
                <span>{new Date(activeModalScan.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F9F6] border-t border-[#E0E7E0] flex justify-end">
              <button
                onClick={() => setActiveModalScan(null)}
                className="px-4 py-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-bold hover:bg-[#1B4332] transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
