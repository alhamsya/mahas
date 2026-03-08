import { useState } from 'react';
import { Briefcase } from 'lucide-react';

export default function PositionSizingCalculator() {
  const [totalCapital, setTotalCapital] = useState('');
  const [riskPercentage, setRiskPercentage] = useState(1);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  const capital = Number(totalCapital) || 0;
  const risk = Number(riskPercentage) || 0;
  const entry = Number(entryPrice) || 0;
  const sl = Number(stopLossPrice) || 0;

  const maxRiskAmount = capital * (risk / 100);
  const riskPerShare = entry - sl;
  
  let suggestedShares = 0;
  if (riskPerShare > 0) {
    suggestedShares = maxRiskAmount / riskPerShare;
  }
  
  const suggestedLots = Math.floor(suggestedShares / 100);
  const positionValue = suggestedLots * 100 * entry;
  const capitalUsedPercentage = capital > 0 ? (positionValue / capital) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Position Sizing</h2>
          <p className="text-gray-500">Hitung berapa banyak lot yang ideal untuk dibeli sesuai toleransi risiko Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">Profil Risiko</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Modal (Rp)</label>
                  <input 
                    type="number" 
                    value={totalCapital}
                    onChange={(e) => setTotalCapital(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 10000000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risiko per Trade (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">Standar aman: 1% - 2% dari total modal</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">Setup Trading</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Entry (Rp)</label>
                  <input 
                    type="number" 
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 1000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Cut Loss (Rp)</label>
                  <input 
                    type="number" 
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 950"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-purple-100 font-medium mb-4">Rekomendasi Pembelian</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-purple-200 mb-1">Jumlah Ideal (Lot)</p>
                <p className="text-5xl font-bold flex items-baseline gap-2">
                  {suggestedLots > 0 ? Math.max(0, suggestedLots).toLocaleString('id-ID') : '0'} 
                  <span className="text-xl font-medium text-purple-200">Lot</span>
                </p>
              </div>

              <div className="h-px bg-white/20 w-full rounded-full"></div>

              <div className="space-y-3 relative text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="opacity-80">Nilai Posisi Baru</span>
                  <span className="font-semibold">Rp {positionValue > 0 ? positionValue.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="opacity-80">% Penggunaan Modal</span>
                  <span className="font-semibold">{capitalUsedPercentage > 0 ? capitalUsedPercentage.toFixed(2) : 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">Maks. Uang Hilang (Risiko)</span>
                  <span className="font-semibold text-rose-300">Rp {maxRiskAmount > 0 ? maxRiskAmount.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
