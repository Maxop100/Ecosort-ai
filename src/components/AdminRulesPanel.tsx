import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  BookOpen,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { WasteRule, WasteCategory } from '../types';
import { MongoDbSetupCard } from './MongoDbSetupCard';

interface AdminRulesPanelProps {
  rules: WasteRule[];
  onAddRule: (rule: Omit<WasteRule, 'id' | 'updatedAt'>) => Promise<void>;
  onUpdateRule: (id: string, rule: Partial<WasteRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onResetSeed: () => Promise<void>;
}

export const AdminRulesPanel: React.FC<AdminRulesPanelProps> = ({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onResetSeed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WasteRule | null>(null);

  // Form states
  const [formKeywords, setFormKeywords] = useState('');
  const [formCategory, setFormCategory] = useState<WasteCategory>('recyclable');
  const [formInstruction, setFormInstruction] = useState('');
  const [formMunicipality, setFormMunicipality] = useState('general');
  const [formBinColor, setFormBinColor] = useState('blue');
  const [formSpecialNotes, setFormSpecialNotes] = useState('');

  // RAG Simulator Test State
  const [testQuery, setTestQuery] = useState('');
  const [simulatedMatch, setSimulatedMatch] = useState<WasteRule | null>(null);

  const openAddModal = () => {
    setEditingRule(null);
    setFormKeywords('');
    setFormCategory('recyclable');
    setFormInstruction('');
    setFormMunicipality('general');
    setFormBinColor('blue');
    setFormSpecialNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: WasteRule) => {
    setEditingRule(rule);
    setFormKeywords(rule.itemKeyword);
    setFormCategory(rule.category);
    setFormInstruction(rule.disposalInstruction);
    setFormMunicipality(rule.municipality);
    setFormBinColor(rule.binColor || 'blue');
    setFormSpecialNotes(rule.specialNotes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeywords.trim() || !formInstruction.trim()) return;

    if (editingRule) {
      await onUpdateRule(editingRule.id, {
        itemKeyword: formKeywords.trim(),
        category: formCategory,
        disposalInstruction: formInstruction.trim(),
        municipality: formMunicipality.trim(),
        binColor: formBinColor,
        specialNotes: formSpecialNotes.trim()
      });
    } else {
      await onAddRule({
        itemKeyword: formKeywords.trim(),
        category: formCategory,
        disposalInstruction: formInstruction.trim(),
        municipality: formMunicipality.trim(),
        binColor: formBinColor,
        specialNotes: formSpecialNotes.trim()
      });
    }
    setIsModalOpen(false);
  };

  const handleTestSimulator = () => {
    if (!testQuery.trim()) return;
    const query = testQuery.toLowerCase();
    const match = rules.find((r) =>
      r.itemKeyword.toLowerCase().includes(query) ||
      query.includes(r.itemKeyword.toLowerCase().split(',')[0])
    ) || rules[0];
    setSimulatedMatch(match || null);
  };

  const filteredRules = rules.filter((rule) => {
    const matchesMuni = selectedMunicipality === 'all' || rule.municipality === selectedMunicipality;
    const matchesCat =
      selectedCategory === 'all' ||
      rule.category === selectedCategory ||
      (selectedCategory === 'general' && (rule.category === 'general' || rule.category === 'general-waste'));
    const matchesSearch =
      rule.itemKeyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.disposalInstruction.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMuni && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* MongoDB Cloud Integration & Diagnostics Assistant */}
      <MongoDbSetupCard />

      <div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E7E0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332] font-['Space_Grotesk'] tracking-tight">
              Municipal Waste Rules (RAG Knowledge Base)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F0FFF4] text-[#2D6A4F] border border-[#B7E4C7]">
              {rules.length} Rules Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#52796F] mt-0.5 font-medium">
            Administer municipal sorting rules queried by the RAG layer. Protects against hardcoded instructions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-seed-rules-btn"
            onClick={() => {
              if (confirm('Reset knowledge base to the initial seed catalog of 28 municipal rules?')) {
                onResetSeed();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E0E7E0] bg-white hover:bg-[#F0FFF4] text-[#1B4332] text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Reset Seed</span>
          </button>

          <button
            id="add-waste-rule-btn"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Municipal Rule</span>
          </button>
        </div>
      </div>

      {/* Live RAG Retrieval Simulator Widget */}
      <div className="p-5 rounded-2xl bg-[#F0FFF4] border border-[#B7E4C7]">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
            RAG Retrieval Test Simulator
          </span>
        </div>
        <p className="text-xs text-[#52796F] mb-3 font-medium">
          Type an item description to simulate keyword and token match against your knowledge base rules.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. Broken mercury thermometer or greasy pizza cardboard..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#B7E4C7] text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#52B788]/20"
          />
          <button
            type="button"
            onClick={handleTestSimulator}
            className="px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Simulate RAG
          </button>
        </div>

        {simulatedMatch && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-white border border-[#B7E4C7] text-xs text-[#1B4332] space-y-1 animate-in fade-in shadow-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[#2D6A4F] capitalize">
                Matched: {simulatedMatch.itemKeyword.split(',')[0]} ({simulatedMatch.category})
              </span>
              <span className="text-[10px] bg-[#F0F4EF] px-2 py-0.5 rounded-md text-[#1B4332] font-mono">
                Muni: {simulatedMatch.municipality}
              </span>
            </div>
            <p className="text-[#52796F] font-medium">{simulatedMatch.disposalInstruction}</p>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#52796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords or instructions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#52B788]/20"
          />
        </div>

        {/* Municipality Filter */}
        <select
          value={selectedMunicipality}
          onChange={(e) => setSelectedMunicipality(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] text-xs text-[#1B4332] font-semibold bg-[#F7F9F6] outline-none cursor-pointer focus:border-[#2D6A4F]"
        >
          <option value="all">All Municipalities</option>
          <option value="general">General</option>
          <option value="san_francisco">San Francisco</option>
          <option value="bengaluru">Bengaluru</option>
          <option value="london">London</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] text-xs text-[#1B4332] font-semibold bg-[#F7F9F6] outline-none cursor-pointer focus:border-[#2D6A4F]"
        >
          <option value="all">All Categories</option>
          <option value="recyclable">Recyclable</option>
          <option value="organic">Organic</option>
          <option value="e-waste">E-Waste</option>
          <option value="hazardous">Hazardous</option>
          <option value="general">General Waste</option>
        </select>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E0E7E0]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F9F6] border-b border-[#E0E7E0] text-[#52796F] uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Item Keywords</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Disposal Instruction</th>
              <th className="py-3.5 px-4">Municipality</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E7E0] bg-white">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-[#F7F9F6] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#1B4332] max-w-[180px] truncate">
                  {rule.itemKeyword}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                      rule.category === 'recyclable'
                        ? 'bg-[#E8F5E9] text-[#2D6A4F] border-[#C8E6C9]'
                        : rule.category === 'organic'
                        ? 'bg-[#D8F3DC] text-[#1B4332] border-[#B7E4C7]'
                        : rule.category === 'e-waste'
                        ? 'bg-[#FFF3E0] text-[#D35400] border-[#FFE0B2]'
                        : rule.category === 'hazardous'
                        ? 'bg-[#FDF2E9] text-[#C0392B] border-[#FADBD8]'
                        : 'bg-[#F0F4EF] text-[#52796F] border-[#E0E7E0]'
                    }`}
                  >
                    {rule.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#52796F] max-w-sm font-medium">
                  <p className="line-clamp-2">{rule.disposalInstruction}</p>
                </td>
                <td className="py-3.5 px-4 text-[#1B4332] capitalize font-medium">
                  {rule.municipality.replace('_', ' ')}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(rule)}
                      className="p-1.5 text-[#2D6A4F] hover:bg-[#D8F3DC] rounded-xl transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete rule "${rule.itemKeyword.split(',')[0]}"?`)) {
                          onDeleteRule(rule.id);
                        }
                      }}
                      className="p-1.5 text-[#52796F] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E0E7E0] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[#E0E7E0] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1B4332]">
                {editingRule ? 'Edit Municipal Waste Rule' : 'Create New Municipal Waste Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#52796F] hover:text-[#1B4332] rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Item Keywords (comma separated):
                </label>
                <input
                  type="text"
                  required
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. aluminum can, soda can, tin can"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">Category:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as WasteCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] text-xs text-[#1B4332] font-semibold bg-[#F7F9F6] outline-none focus:border-[#2D6A4F]"
                  >
                    <option value="recyclable">Recyclable</option>
                    <option value="organic">Organic</option>
                    <option value="e-waste">E-Waste</option>
                    <option value="hazardous">Hazardous</option>
                    <option value="general">General Waste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">Municipality:</label>
                  <input
                    type="text"
                    required
                    value={formMunicipality}
                    onChange={(e) => setFormMunicipality(e.target.value)}
                    placeholder="general, san_francisco, london..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Disposal Instruction (retrieved by RAG):
                </label>
                <textarea
                  required
                  rows={3}
                  value={formInstruction}
                  onChange={(e) => setFormInstruction(e.target.value)}
                  placeholder="Clear municipal instruction for correct bin placement..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">Bin Color Name:</label>
                  <input
                    type="text"
                    value={formBinColor}
                    onChange={(e) => setFormBinColor(e.target.value)}
                    placeholder="Blue, Green, Red, Yellow..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B4332] mb-1">Special Notes:</label>
                  <input
                    type="text"
                    value={formSpecialNotes}
                    onChange={(e) => setFormSpecialNotes(e.target.value)}
                    placeholder="Why this rule matters..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E7E0] bg-[#F7F9F6] focus:bg-white text-xs text-[#1B4332] font-medium outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E0E7E0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#52796F] hover:bg-[#F0F4EF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingRule ? 'Save Changes' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
