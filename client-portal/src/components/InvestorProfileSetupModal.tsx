import React, { useState } from 'react';
import { investorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  X,
  MapPin,
  IndianRupee,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface InvestorProfileSetupModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const InvestorProfileSetupModal: React.FC<InvestorProfileSetupModalProps> = ({
  onClose,
  onSaved,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [city, setCity] = useState(user?.profile?.city || 'Chandigarh');
  const [state, setState] = useState(user?.profile?.state || 'Punjab');
  const [budgetBracket, setBudgetBracket] = useState(
    user?.profile?.investmentBudget?.bracket || '25L_50L'
  );
  const [experienceYears, setExperienceYears] = useState(
    user?.profile?.businessExperienceYears || 3
  );
  const [spaceSqFt, setSpaceSqFt] = useState(
    user?.profile?.availableCommercialSpaceSqFt || 1000
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user?.profile?.preferredCategories || ['Food', 'EV']
  );
  const [selectedModels, setSelectedModels] = useState<string[]>(
    user?.profile?.franchiseModelPreference || ['FOFO']
  );

  const budgetOptions = [
    { id: 'UNDER_5L', label: 'Under ₹5 Lakh', min: 100000, max: 500000 },
    { id: '5L_10L', label: '₹5L – ₹10 Lakh', min: 500000, max: 1000000 },
    { id: '10L_25L', label: '₹10L – ₹25 Lakh', min: 1000000, max: 2500000 },
    { id: '25L_50L', label: '₹25L – ₹50 Lakh', min: 2500000, max: 5000000 },
    { id: '50L_1CR', label: '₹50L – ₹1 Crore', min: 5000000, max: 10000000 },
    { id: '1CR_PLUS', label: '₹1 Crore+', min: 10000000, max: 50000000 },
  ];

  const categoryList = [
    'Food',
    'Education',
    'Retail',
    'Fitness',
    'Beauty',
    'Healthcare',
    'EV',
    'Technology',
  ];

  const modelOptions = [
    { id: 'FOFO', title: 'FOFO', desc: 'Franchise Owned, Franchise Operated (Self Managed)' },
    { id: 'FOCO', title: 'FOCO', desc: 'Franchise Owned, Company Operated (Passive Income)' },
    { id: 'COCO', title: 'COCO', desc: 'Company Owned, Company Operated' },
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const selectedBudgetObj = budgetOptions.find((b) => b.id === budgetBracket);
      await investorApi.updateProfile({
        city,
        state,
        budgetBracket,
        minINR: selectedBudgetObj?.min,
        maxINR: selectedBudgetObj?.max,
        businessExperienceYears: Number(experienceYears),
        availableCommercialSpaceSqFt: Number(spaceSqFt),
        preferredCategories: selectedCategories,
        franchiseModelPreference: selectedModels,
      });

      onSaved();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Investor AI Matchmaking Profiler</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Step {step} of 4</span>
            <span className="text-blue-400 font-semibold">
              {step === 1 && 'Location & Space'}
              {step === 2 && 'Investment Budget'}
              {step === 3 && 'Category Preferences'}
              {step === 4 && 'Business Model'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-5 min-h-[260px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target City & State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (e.g. Chandigarh)"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State (e.g. Punjab)"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Business Exp. (Years)
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Available Area (Sq.Ft.)
                  </label>
                  <input
                    type="number"
                    value={spaceSqFt}
                    onChange={(e) => setSpaceSqFt(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Select Your Maximum Investment Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBudgetBracket(opt.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      budgetBracket === opt.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Select Categories You Wish to Explore
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categoryList.map((cat) => {
                  const isSel = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Preferred Franchise Operating Model
              </label>
              <div className="space-y-2">
                {modelOptions.map((m) => {
                  const isSel = selectedModels.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModel(m.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSel
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{m.title}</span>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Recalculating...' : 'Update & Match Brands'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
