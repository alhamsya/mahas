import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function ProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [lot, setLot] = useState(0);
  const [buyFee, setBuyFee] = useState(0.15);
  const [sellFee, setSellFee] = useState(0.25);

  const buyValue = (Number(buyPrice) || 0) * (Number(lot) || 0) * 100;
  const sellValue = (Number(sellPrice) || 0) * (Number(lot) || 0) * 100;
  
  const totalBuyFee = buyValue * (buyFee / 100);
  const totalSellFee = sellValue * (sellFee / 100);
  
  const netBuyValue = buyValue + totalBuyFee;
  const netSellValue = sellValue - totalSellFee;
  
  const profitLoss = netSellValue - netBuyValue;
  const profitLossPercentage = netBuyValue > 0 ? (profitLoss / netBuyValue) * 100 : 0;
  const isProfit = profitLoss >= 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profit Calculator</h2>
          <p className="text-gray-500">Hitung simulasi potensi profit atau loss dari trading Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">Parameter Trading</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Rp)</label>
                  <input 
                    type="number" 
                    value={buyPrice || ''}
                    onChange={(e) => setBuyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input 
                    type="number" 
                    value={sellPrice || ''}
                    onChange={(e) => setSellPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Lot</label>
                  <input 
                    type="number" 
                    value={lot || ''}
                    onChange={(e) => setLot(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">Fee Broker (%)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Beli (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={buyFee}
                    onChange={(e) => setBuyFee(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Jual (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={sellFee}
                    onChange={(e) => setSellFee(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl shadow-lg p-6 text-white transition-colors duration-300 ${isProfit ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <h3 className="font-medium opacity-90 mb-4">Estimasi Net {isProfit ? 'Profit' : 'Loss'}</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-bold flex items-baseline gap-1">
                  <span className="text-xl font-medium opacity-80">Rp</span>
                  {Math.abs(profitLoss).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                  {isProfit ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                </div>
              </div>

              <div className="h-px bg-white/20 w-full rounded-full"></div>

              <div className="space-y-3 relative text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="opacity-80">Total Modal (inc. Fee)</span>
                  <span className="font-semibold">Rp {netBuyValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="opacity-80">Total Jual (netto)</span>
                  <span className="font-semibold">Rp {netSellValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80">Total Fee Beli+Jual</span>
                  <span className="font-semibold text-rose-100">Rp {(totalBuyFee + totalSellFee).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
