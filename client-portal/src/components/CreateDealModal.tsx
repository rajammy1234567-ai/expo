import React, { useState } from 'react';
import { dealApi } from '../services/api';
import { ILead, IBrand } from '../types';
import {
  X,
  DollarSign,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Calendar,
  Building2,
} from 'lucide-react';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: IBrand | null;
  leads: ILead[];
  onDealRecorded: () => void;
}

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  brand,
  leads,
  onDealRecorded,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Step 1: Investor Selection
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?._id || '');
  const [customInvestorName, setCustomInvestorName] = useState('Rohit Sharma');
  const [customInvestorPhone, setCustomInvestorPhone] = useState('+91 98888 12345');
  const [franchiseCity, setFranchiseCity] = useState('Chandigarh');
  const [unitModel, setUnitModel] = useState<'FOFO' | 'FOCO'>('FOFO');

  // Step 2: Deal Financials
  const [dealValueINR, setDealValueINR] = useState<number>(2500000);
  const [brandNotes, setBrandNotes] = useState('Prime high-street outlet agreement finalized with bank token confirmation.');
  const [agreementDocUrl, setAgreementDocUrl] = useState('https://vizexpo.in/agreements/franchise-deed-signed.pdf');

  // Auto Calculations (3% Platform Fee + 18% GST)
  const commissionRate = 3.0;
  const commissionINR = Math.round(dealValueINR * (commissionRate / 100));
  const gstINR = Math.round(commissionINR * 0.18);
  const totalInvoiceINR = commissionINR + gstINR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealValueINR || dealValueINR < 100000) {
      setErrorMsg('Please enter a valid franchise deal value (min ₹1,00,000)');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const selectedLead = leads.find((l) => l._id === selectedLeadId);
      const investorId = (selectedLead?.investorId as any)?._id || (selectedLead?.investorId as any) || '65e100000000000000000001';

      const payload = {
        brandId: brand?._id || '65e000000000000000000001',
        investorId,
        leadId: selectedLeadId || undefined,
        franchiseCity,
        franchiseUnitModel: unitModel,
        totalDealValueINR: Number(dealValueINR),
        commissionRatePercentage: commissionRate,
        calculatedCommissionINR: commissionINR,
        taxINR: gstINR,
        totalInvoiceAmountINR: totalInvoiceINR,
        brandNotes,
        agreementDocUrl,
        status: 'PENDING_VERIFICATION',
      };

      const res = await dealApi.recordDeal(payload);

      if (res.data.success) {
        setSuccessToast('Franchise Deal successfully recorded and sent to VIZ Commission Ledger!');
        setTimeout(() => {
          onDealRecorded();
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.data.message || 'Deal submission failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error recording deal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-['Outfit']">
              Record Closed Franchise Deal
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Submit finalized franchise deed to generate the 3% success fee invoice and initiate territory lock.
          </p>
        </div>

        {/* Lifecycle Steps Indicator */}
        <div className="flex items-center justify-between text-xs px-2">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Investor & City</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Financials & GST</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successToast && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Step 1: Investor & Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select from Active CRM Leads
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  const found = leads.find((l) => l._id === e.target.value);
                  if (found) {
                    setCustomInvestorName(found.investorSnapshot?.name || found.investorName || '');
                    setCustomInvestorPhone(found.investorSnapshot?.phone || found.investorPhone || '');
                    const city = found.investorSnapshot?.city || found.preferredCity;
                    if (city) setFranchiseCity(city);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.investorSnapshot?.name || l.investorName || 'Investor'} (
                    {l.investorSnapshot?.city || l.preferredCity || 'City'}) — {l.status}
                  </option>
                ))}
                <option value="">+ Direct Custom Investor</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Investor Name
                </label>
                <input
                  type="text"
                  value={customInvestorName}
                  onChange={(e) => setCustomInvestorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={customInvestorPhone}
                  onChange={(e) => setCustomInvestorPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Allotted Franchise Territory / City
                </label>
                <input
                  type="text"
                  value={franchiseCity}
                  onChange={(e) => setFranchiseCity(e.target.value)}
                  placeholder="e.g. Chandigarh Sector 35"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unit Format
                </label>
                <select
                  value={unitModel}
                  onChange={(e) => setUnitModel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="FOFO">FOFO (Franchise Owned, Franchise Operated)</option>
                  <option value="FOCO">FOCO (Franchise Owned, Company Operated)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <span>Next: Deal Financials</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Financials & 3% Fee + 18% GST */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Closed Franchise Deal Value (₹) *
              </label>
              <input
                type="number"
                value={dealValueINR}
                onChange={(e) => setDealValueINR(Number(e.target.value))}
                step="50000"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-base font-bold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Live Financial Breakdown Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Automated Platform Reconciliation Breakdown</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Deal Capital</span>
                <span className="font-semibold text-white">₹{dealValueINR.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">VIZ Platform Success Fee (3.0%)</span>
                <span className="font-semibold text-cyan-400">₹{commissionINR.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Applicable GST (18.0%)</span>
                <span className="font-semibold text-purple-400">₹{gstINR.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                <span className="text-white">Total Platform Invoice</span>
                <span className="text-emerald-400">₹{totalInvoiceINR.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Signed Agreement / Token Slip Document URL
              </label>
              <input
                type="url"
                value={agreementDocUrl}
                onChange={(e) => setAgreementDocUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <span>Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Final Confirmation */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2 text-xs">
              <h4 className="font-bold text-sm text-white">Deal Summary for Settlement</h4>
              <p className="text-slate-300">
                <strong>Investor:</strong> {customInvestorName} ({customInvestorPhone})
              </p>
              <p className="text-slate-300">
                <strong>Brand:</strong> {brand?.brandName || 'Brand Partner'}
              </p>
              <p className="text-slate-300">
                <strong>Territory:</strong> {franchiseCity} ({unitModel})
              </p>
              <p className="text-slate-300">
                <strong>Deal Capital:</strong> ₹{dealValueINR.toLocaleString('en-IN')}
              </p>
              <p className="text-emerald-400 font-bold">
                <strong>VIZ Platform Invoice:</strong> ₹{totalInvoiceINR.toLocaleString('en-IN')} (Status: PENDING_SETTLEMENT)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Closing Remarks / Territory Conditions
              </label>
              <textarea
                value={brandNotes}
                onChange={(e) => setBrandNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Submit to Admin Ledger</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
