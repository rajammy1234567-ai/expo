import React, { useState, useRef } from 'react';
import { brandManageApi, uploadApi } from '../services/api';
import {
  X,
  Building2,
  DollarSign,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface CreateFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateFranchiseModal: React.FC<CreateFranchiseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [businessModel, setBusinessModel] = useState<'FOFO' | 'FOCO'>('FOFO');

  // Financials
  const [minINR, setMinINR] = useState(1500000);
  const [maxINR, setMaxINR] = useState(2500000);
  const [franchiseFeeINR, setFranchiseFeeINR] = useState(350000);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(4);
  const [minSpace, setMinSpace] = useState(250);
  const [maxSpace, setMaxSpace] = useState(500);

  // Media & Video
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop');
  const [pitchVideoUrl, setPitchVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-hands-preparing-a-tasty-burger-41132-large.mp4');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&h=600&fit=crop');

  // Expansion
  const [targetCities, setTargetCities] = useState('Delhi NCR, Chandigarh, Jaipur, Lucknow');
  const [existingOutlets, setExistingOutlets] = useState(8);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        setLoading(true);
        const res = await uploadApi.uploadImage(base64);
        if (res.data.success) {
          setLogoUrl(res.data.url);
        }
      } catch (err: any) {
        setErrorMsg('Logo upload failed.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setErrorMsg('Brand name is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        brandName,
        tagline,
        description,
        category,
        businessModel,
        investmentRange: {
          minINR: Number(minINR),
          maxINR: Number(maxINR),
          displayString: `₹${(minINR / 100000).toFixed(0)}L – ₹${(maxINR / 100000).toFixed(0)}L`,
        },
        franchiseFeeINR: Number(franchiseFeeINR),
        royaltyPercentage: Number(royaltyPercentage),
        requiredAreaSqFt: {
          min: Number(minSpace),
          max: Number(maxSpace),
          displayString: `${minSpace} – ${maxSpace} sq.ft.`,
        },
        logoUrl,
        pitchVideoUrl,
        bannerUrl,
        targetExpansionCities: targetCities.split(',').map((c) => c.trim()),
        existingOutletsCount: Number(existingOutlets),
      };

      const res = await brandManageApi.createListing(payload);

      if (res.data.success) {
        setSuccessToast('Franchise booth submitted for KYC Review!');
        setTimeout(() => {
          onCreated();
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.data.message || 'Creation failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-white max-h-[90vh] overflow-y-auto">
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
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-['Outfit']">
              Create New Franchise / Brand Booth
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Publish your franchise opportunity to 1,250+ active verified investors on the Expo Floor.
          </p>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2 px-3 rounded-xl font-semibold text-center border transition-all ${
              step === 1
                ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            1. Brand Info
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-2 px-3 rounded-xl font-semibold text-center border transition-all ${
              step === 2
                ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            2. Economics
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-2 px-3 rounded-xl font-semibold text-center border transition-all ${
              step === 3
                ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            3. Media & Submit
          </button>
        </div>

        {/* Alerts */}
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

        {/* Step 1: Brand Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand / Franchise Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Biryani Blues Express"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Food">Food & Beverage</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Fitness">Fitness & Wellness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Model
                </label>
                <select
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="FOFO">FOFO (Franchise Owned, Franchise Operated)</option>
                  <option value="FOCO">FOCO (Franchise Owned, Company Operated)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catchy Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. India's Fastest Growing Cloud Kitchen Franchise"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Franchise Overview & Concept
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your unit model, customer demographic, and daily throughput..."
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <span>Next: Unit Economics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Unit Economics */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Min Investment (₹)
                </label>
                <input
                  type="number"
                  value={minINR}
                  onChange={(e) => setMinINR(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Investment (₹)
                </label>
                <input
                  type="number"
                  value={maxINR}
                  onChange={(e) => setMaxINR(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Franchise Fee (₹)
                </label>
                <input
                  type="number"
                  value={franchiseFeeINR}
                  onChange={(e) => setFranchiseFeeINR(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monthly Royalty (%)
                </label>
                <input
                  type="number"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Min Carpet Area (sq.ft.)
                </label>
                <input
                  type="number"
                  value={minSpace}
                  onChange={(e) => setMinSpace(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Carpet Area (sq.ft.)
                </label>
                <input
                  type="number"
                  value={maxSpace}
                  onChange={(e) => setMaxSpace(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
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
                <span>Next: Media & Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Media & Submission */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand Logo
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo Photo</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Video Pitch Reel URL (MP4 / WebM)
              </label>
              <input
                type="url"
                value={pitchVideoUrl}
                onChange={(e) => setPitchVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Expansion Cities (Comma separated)
              </label>
              <input
                type="text"
                value={targetCities}
                onChange={(e) => setTargetCities(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Operational Outlets Count
              </label>
              <input
                type="number"
                value={existingOutlets}
                onChange={(e) => setExistingOutlets(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Platform KYC Notice */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                New franchise listings undergo fast KYC review by VIZ Administrators before public display on the Expo Floor.
              </span>
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Submit for KYC Verification</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
