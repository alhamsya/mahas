import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function RiskRewardCalculator() {
  const [entryPrice, setEntryPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  const entry = Number(entryPrice) || 0;
  const target = Number(targetPrice) || 0;
  const sl = Number(stopLossPrice) || 0;

  const potentialProfit = target - entry;
  const potentialLoss = entry - sl;

  const profitPercentage = entry > 0 ? (potentialProfit / entry) * 100 : 0;
  const lossPercentage = entry > 0 ? (potentialLoss / entry) * 100 : 0;

  let riskRewardRatio = 0;
  if (potentialLoss > 0 && potentialProfit > 0) {
    riskRewardRatio = potentialProfit / potentialLoss;
  }

  const isGoodRR = riskRewardRatio >= 2;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk/Reward Calculator</h2>
          <p className="text-gray-500">Evaluasi rasio potensi keuntungan melawan risiko kerugian.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price (Rp)</label>
                <input 
                  type="number" 
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-emerald-600">Target Price (Rp)</label>
                <input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1200"
                  className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-red-600">Stop Loss (Rp)</label>
                <input 
                  type="number" 
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="950"
                  className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <h4 className="font-semibold text-orange-800 text-sm mb-2">Tips Risk/Reward</h4>
            <p className="text-xs text-orange-700/80 leading-relaxed">
              Disarankan mencari setup trading dengan Risk/Reward minimal 1:2. Artinya, potensi profit harus dua kali lipat lebih besar dari risiko cut loss.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl shadow-lg p-6 text-white transition-colors duration-300 ${riskRewardRatio >= 2 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : riskRewardRatio > 0 ? 'bg-gradient-to-br from-orange-500 to-amber-600' : 'bg-gradient-to-br from-gray-500 to-slate-600'}`}>
            <h3 className="font-medium opacity-90 mb-4">Risk/Reward Ratio</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm opacity-80 mb-1">Rasio (Risk : Reward)</p>
                <p className="text-4xl font-bold flex items-baseline gap-2">
                  1 : {riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : '0'} 
                </p>
                {riskRewardRatio > 0 && (
                  <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                    {isGoodRR ? 'Ideal (>= 1:2)' : 'Kurang Ideal (< 1:2)'}
                  </div>
                )}
              </div>

              <div className="h-px bg-white/20 w-full rounded-full"></div>

              <div className="space-y-4 relative text-sm">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="opacity-80">Reward (Profit)</span>
                    <span className="font-semibold text-emerald-100">+{profitPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div className="bg-emerald-300 h-2 rounded-full" style={{ width: `${Math.min(100, profitPercentage * 5)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="opacity-80">Risk (Loss)</span>
                    <span className="font-semibold text-red-100">-{lossPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div className="bg-red-300 h-2 rounded-full" style={{ width: `${Math.min(100, lossPercentage * 5)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
