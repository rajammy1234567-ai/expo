import React, { useState, useEffect } from 'react';
import { IBrand } from '../types';
import { brandApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  GitCompare,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  Trash2,
  Building,
} from 'lucide-react';

interface CompareModalProps {
  onClose: () => void;
  onOpenAI: (brand: IBrand) => void;
  onOpenMeeting: (brand: IBrand) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  onClose,
  onOpenAI,
  onOpenMeeting,
}) => {
  const { compareBrandIds, toggleCompareBrand, clearCompare } = useAuth();
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      if (compareBrandIds.length === 0) {
        setBrands([]);
        setLoading(false);
        return;
      }

      try {
        const res = await brandApi.getBrands({ verifiedOnly: 'false' });
        if (res.data.success) {
          const selected = res.data.brands.filter((b: IBrand) =>
            compareBrandIds.includes(b._id)
          );
          setBrands(selected);
        }
      } catch (err) {
        console.error('Error loading compared brands', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [compareBrandIds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">
              Multi-Brand Franchise Comparison Matrix ({brands.length}/4)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear All</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading comparison details...</div>
          ) : brands.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm text-slate-400">No brands selected for comparison.</p>
              <p className="text-xs text-slate-500">
                Click the compare icon ⚖️ on any brand card on the expo floor to add it here.
              </p>
            </div>
          ) : (
            <div className="min-w-[650px] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 font-semibold text-slate-400 bg-slate-950/50 w-44">Parameters</th>
                    {brands.map((brand) => (
                      <th key={brand._id} className="p-3 bg-slate-950/80 min-w-[200px] align-top">
                        <div className="flex items-center justify-between mb-2">
                          <img
                            src={brand.logoUrl}
                            alt={brand.brandName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <button
                            onClick={() => toggleCompareBrand(brand._id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-white text-sm">{brand.brandName}</h4>
                        <span className="text-[10px] text-blue-400 font-medium">{brand.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {/* Total Investment */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Total Investment</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 font-bold text-emerald-400 text-sm">
                        {b.investmentRange.displayString}
                      </td>
                    ))}
                  </tr>

                  {/* Required Area */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Required Space</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 text-slate-200">
                        {b.requiredAreaSqFt.displayString}
                      </td>
                    ))}
                  </tr>

                  {/* Franchise Model */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Franchise Model</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px]">
                          {b.businessModel}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Franchise Fee */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Franchise Fee</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 text-slate-200">
                        ₹{(b.franchiseFeeINR / 100000).toFixed(1)} Lakh
                      </td>
                    ))}
                  </tr>

                  {/* Royalty Fee */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Royalty / Revenue Share</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 text-slate-200">
                        {b.royaltyPercentage}%
                      </td>
                    ))}
                  </tr>

                  {/* Historical Payback */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Historical Payback</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 font-semibold text-amber-400">
                        {b.estimatedROIHistoricalMonths.min}–{b.estimatedROIHistoricalMonths.max} Months*
                      </td>
                    ))}
                  </tr>

                  {/* Existing Outlets */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Existing Outlets</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 text-slate-300">
                        {b.existingOutletsCount} Outlets (Est. {b.yearEstablished})
                      </td>
                    ))}
                  </tr>

                  {/* Support Matrix */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Site Selection Support</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3">
                        {b.supportOffered?.siteSelection ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Staff Training Support</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3">
                        {b.supportOffered?.staffTraining ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Marketing & Branding</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3">
                        {b.supportOffered?.marketingSupport ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr>
                    <td className="p-3 font-medium text-slate-300 bg-slate-950/30">Direct Action</td>
                    {brands.map((b) => (
                      <td key={b._id} className="p-3 space-y-2">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenAI(b);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Ask AI</span>
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenMeeting(b);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Meet</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
