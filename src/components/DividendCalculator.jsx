import { useState } from 'react';
import { Percent } from 'lucide-react';

export default function DividendCalculator() {
  const [stockPrice, setStockPrice] = useState('');
  const [dividendPerShare, setDividendPerShare] = useState('');
  const [lotAmount, setLotAmount] = useState('');

  const price = Number(stockPrice) || 0;
  const dps = Number(dividendPerShare) || 0;
  const lot = Number(lotAmount) || 0;

  const totalShares = lot * 100;
  const totalInvestment = price * totalShares;
  const totalDividendGross = dps * totalShares;
  
  // Tax 10% in Indonesia for individuals, but we assume gross directly or can add toggle.
  // Assuming net = gross
  
  const dividendYield = price > 0 ? (dps / price) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dividend Calculator</h2>
          <p className="text-gray-500">Hitung Dividend Yield dan estimasi pendapatan dividen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">Data Saham</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli Rata-Rata (Rp)</label>
                  <input 
                    type="number" 
                    value={stockPrice}
                    onChange={(e) => setStockPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Lot</label>
                  <input 
                    type="number" 
                    value={lotAmount}
                    onChange={(e) => setLotAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">Data Dividen</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dividen per Lembar Saham (Rp)</label>
                  <input 
                    type="number" 
                    value={dividendPerShare}
                    onChange={(e) => setDividendPerShare(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">DPS (Dividend Per Share)</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-medium opacity-90 mb-4">Estimasi Dividen</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm opacity-80 mb-1">Total Dividen (Gross)</p>
                <p className="text-4xl font-bold flex items-baseline gap-1">
                  <span className="text-xl font-medium opacity-80">Rp</span>
                  {totalDividendGross.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="h-px bg-white/20 w-full rounded-full"></div>

              <div className="space-y-3 relative text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="opacity-80">Dividend Yield</span>
                  <span className="font-semibold text-lg">{dividendYield.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="opacity-80">Total Modal Investasi</span>
                  <span className="font-semibold">Rp {totalInvestment.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
