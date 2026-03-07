import { useState, useMemo } from 'react';
import { TrendingUp, HelpCircle, RotateCcw, Info, Edit2 } from 'lucide-react';

// IDX Tick Size Rules
const getTickSize = (price) => {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
};

// IDX ARA/ARB Rules (Matching Stockbit / Transitional IDX Rules)
const getAutoRejectionLimits = (price) => {
  let araLimit = 0.20;
  if (price < 200) araLimit = 0.35;
  else if (price >= 200 && price <= 5000) araLimit = 0.25;
  
  // ARB is currently 15% across all price levels based on the reference image
  const arbLimit = 0.15; 
  
  return { ara: araLimit, arb: arbLimit };
};

const calculateTarget = (basePrice, limit, isARA) => {
  let target = isARA ? basePrice * (1 + limit) : basePrice * (1 - limit);
  const tick = getTickSize(target);
  // Round down for ARB, Round up or nearest for ARA (standard practice is nearest valid tick)
  // Let's use Math.round as before, or stockbit might floor/ceil.
  // Generally, ARB is floored to the nearest tick, ARA is ceiled.
  // Actually, standard nearest rounding usually matches IDX floor/ceil rules closely enough, but let's be precise.
  if (isARA) return Math.floor(target / tick) * tick; 
  return Math.ceil(target / tick) * tick;
};

export default function ProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState('4960');
  const [sellPrice, setSellPrice] = useState('6025');
  const [lot, setLot] = useState('100');
  const [buyFee, setBuyFee] = useState(0.15);
  const [sellFee, setSellFee] = useState(0.25);
  const [isEditingFees, setIsEditingFees] = useState(false);

  // Formatting utilities
  const formatInputValue = (val) => {
    if (val === undefined || val === null) return '';
    const strVal = String(val);
    if (!strVal) return '';

    const parts = strVal.split('.'); // Dot for decimals
    let wholePart = parts[0] || '';
    const decimalPart = parts[1];

    wholePart = wholePart.replace(/\D/g, '');
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Comma for thousands

    if (strVal.endsWith('.')) {
      return `${formattedWhole}.`;
    }

    if (decimalPart !== undefined) {
      const cleanDecimal = decimalPart.replace(/\D/g, '');
      return `${formattedWhole}.${cleanDecimal}`;
    }

    return formattedWhole;
  };

  const parseFormattedVal = (formattedStr) => {
    if (!formattedStr) return 0;
    // Remove commas for thousands
    const rawNumStr = formattedStr.replace(/,/g, '');
    return Number(rawNumStr) || 0;
  };

  const handleNumericalChange = (setter, value, element) => {
    // 1. Capture current cursor and pure digits before it
    const cursor = element.selectionStart;
    const oldVal = element.value;
    const digitsBefore = oldVal.substring(0, cursor).replace(/\D/g, '').length;

    // 2. Set new raw value 
    const rawVal = value.replace(/,/g, ''); // normalize to standard JS format
    
    // Allow empty string or valid number structure
    if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
        setter(rawVal);
    }

    // 3. Keep cursor position
    requestAnimationFrame(() => {
      const newVal = element.value;
      let newCursor = 0;
      let digitsFound = 0;

      for (let i = 0; i < newVal.length; i++) {
        if (digitsFound === digitsBefore) break;
        if (/\d/.test(newVal[i])) digitsFound++;
        newCursor = i + 1;
      }

      element.setSelectionRange(newCursor, newCursor);
    });
  };

  const buyPriceNum = Number(buyPrice) || 0;
  const sellPriceNum = Number(sellPrice) || 0;
  const lotNum = Number(lot) || 0;

  const buyValue = useMemo(() => buyPriceNum * lotNum * 100, [buyPriceNum, lotNum]);
  const sellValue = useMemo(() => sellPriceNum * lotNum * 100, [sellPriceNum, lotNum]);
  
  const totalBuyFee = useMemo(() => buyValue * (buyFee / 100), [buyValue, buyFee]);
  const totalSellFee = useMemo(() => sellValue * (sellFee / 100), [sellValue, sellFee]);
  
  const netBuyValue = useMemo(() => buyValue + totalBuyFee, [buyValue, totalBuyFee]);
  const netSellValue = useMemo(() => sellValue - totalSellFee, [sellValue, totalSellFee]);
  
  const netProfit = useMemo(() => netSellValue - netBuyValue, [netSellValue, netBuyValue]);
  const returnValue = useMemo(() => netBuyValue > 0 ? (netProfit / netBuyValue) * 100 : 0, [netProfit, netBuyValue]);
  const isProfit = netProfit >= 0;

  const currentARA = useMemo(() => calculateTarget(buyPriceNum, getAutoRejectionLimits(buyPriceNum).ara, true), [buyPriceNum]);
  const currentARB = useMemo(() => calculateTarget(buyPriceNum, getAutoRejectionLimits(buyPriceNum).arb, false), [buyPriceNum]);

  const projections = useMemo(() => {
    let results = [];
    let lastAraPrice = buyPriceNum;
    let lastArbPrice = buyPriceNum;
    
    for (let i = 1; i <= 5; i++) {
        const limitsAra = getAutoRejectionLimits(lastAraPrice);
        const ara = calculateTarget(lastAraPrice, limitsAra.ara, true);
        
        const limitsArb = getAutoRejectionLimits(lastArbPrice);
        const arb = calculateTarget(lastArbPrice, limitsArb.arb, false);
        
        results.push({ 
            day: i, 
            ara, 
            arb, 
            araLimitStr: (limitsAra.ara * 100).toFixed(0),
            arbLimitStr: (limitsArb.arb * 100).toFixed(0)
        });
        
        lastAraPrice = ara;
        lastArbPrice = arb;
    }
    return results;
  }, [buyPriceNum]);

  const handleReset = () => {
    setBuyPrice('');
    setSellPrice('');
    setLot('');
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
  };

  // State stores standard JS numbers as strings (e.g. '1000.5')
  const displayBuyPrice = formatInputValue(buyPrice);
  const displaySellPrice = formatInputValue(sellPrice);
  const displayLot = formatInputValue(lot);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: Profit Calculator */}
        <div className="bg-[#131a26] rounded-[32px] border border-[#1e293b] p-8 shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(82,251,162,0.1)] flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <h2 className="text-lg font-bold text-brand-green">Profit Calculator</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-white transition-colors">
                <HelpCircle className="w-4 h-4" /> Bantuan
              </button>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-white transition-colors">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Buy Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Buy Price</label>
                <Info className="w-3.5 h-3.5 text-text-muted/50" />
              </div>
              <div className="relative group">
                <input 
                  type="text"
                  inputMode="decimal"
                  value={displayBuyPrice}
                  onChange={(e) => handleNumericalChange(setBuyPrice, e.target.value, e.target)}
                  className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-brand-green/30 transition-all placeholder:text-[#1e293b]"
                  placeholder="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <div className="px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400">ARB <span className="text-red-300 ml-1">{currentARB}</span></div>
                  <div className="px-2 py-1 rounded-md bg-brand-green/10 border border-brand-green/20 text-[10px] font-black text-brand-green">ARA <span className="text-emerald-300 ml-1">{currentARA}</span></div>
                </div>
              </div>
            </div>

            {/* Sell Price Target */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Sell Price Target</label>
                <Info className="w-3.5 h-3.5 text-text-muted/50" />
              </div>
              <input 
                type="text"
                inputMode="decimal"
                value={displaySellPrice}
                onChange={(e) => handleNumericalChange(setSellPrice, e.target.value, e.target)}
                className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-brand-green/30 transition-all placeholder:text-[#1e293b]"
                placeholder="0"
              />
            </div>

            {/* Lots */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Lots</label>
                <Info className="w-3.5 h-3.5 text-text-muted/50" />
              </div>
              <input 
                type="text"
                inputMode="decimal"
                value={displayLot}
                onChange={(e) => handleNumericalChange(setLot, e.target.value, e.target)}
                className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-brand-green/30 transition-all placeholder:text-[#1e293b]"
                placeholder="0"
              />
            </div>

            {/* Fees */}
            <div className="flex justify-between items-center py-2">
               <span className="text-xs font-medium text-text-muted italic">Fees (Buy {buyFee}% / Sell {sellFee}%)</span>
               <button onClick={() => setIsEditingFees(!isEditingFees)} className="text-xs font-bold text-brand-green hover:underline">Edit Fees</button>
            </div>

            {isEditingFees && (
               <div className="grid grid-cols-2 gap-4 p-4 bg-[#0f1623] rounded-2xl border border-[#1e293b] animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Buy Fee (%)</label>
                    <input type="number" step="0.01" value={buyFee} onChange={(e) => setBuyFee(Number(e.target.value))} className="w-full bg-[#131a26] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sell Fee (%)</label>
                    <input type="number" step="0.01" value={sellFee} onChange={(e) => setSellFee(Number(e.target.value))} className="w-full bg-[#131a26] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
               </div>
            )}

            {/* Result Section */}
            <div className="mt-8 bg-[#0f1623] rounded-3xl p-6 border border-[#1e293b] relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">NET PROFIT</label>
                    <div className={`text-2xl font-black ${isProfit ? 'text-brand-green' : 'text-red-400'}`}>
                        {formatIDR(netProfit)}
                    </div>
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">RETURN</label>
                    <div className={`text-2xl font-black ${isProfit ? 'text-brand-green' : 'text-red-400'}`}>
                        {returnValue.toFixed(2)}%
                    </div>
                  </div>
               </div>
               
               <div className="h-px bg-[#1e293b] mb-6"></div>

               <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-muted">Total Capital</span>
                    <span className="text-text-secondary">{formatIDR(netBuyValue)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-muted">Total Value</span>
                    <span className="text-text-secondary">{formatIDR(netSellValue)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-muted">Fees & Tax</span>
                    <span className="text-red-400/80">-{formatIDR(totalBuyFee + totalSellFee)}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Card: ARA / ARB Projection */}
        <div className="bg-[#131a26] rounded-[32px] border border-[#1e293b] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[rgba(58,123,213,0.1)] flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <h2 className="text-lg font-bold text-white">ARA / ARB Projection</h2>
            <div className="px-3 py-1 rounded-full bg-[#1e293b] border border-[#2d3748] text-[10px] font-bold text-text-muted">Based on {buyPrice}</div>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-12 px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">
                <div className="col-span-4">Day</div>
                <div className="col-span-4 text-right">ARA <span className="opacity-50">(Limit)</span></div>
                <div className="col-span-4 text-right">ARB <span className="opacity-50">(Limit)</span></div>
             </div>

             <div className="space-y-2">
                {projections.map((row) => (
                    <div key={row.day} className="grid grid-cols-12 items-center bg-[#0f1623] hover:bg-[#1a2232] transition-all rounded-2xl p-4 border border-transparent hover:border-[#1e293b] group">
                        <div className="col-span-4 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-[#2d3748] flex items-center justify-center text-[11px] font-bold text-text-muted group-hover:text-white transition-colors">
                                {row.day}
                            </div>
                            <span className="text-sm font-bold text-text-secondary group-hover:text-white">T+{row.day}</span>
                        </div>
                        <div className="col-span-4 text-right">
                            <div className="text-lg font-black text-brand-green">{row.ara}</div>
                            <div className="text-[10px] font-bold text-brand-green/60">+{row.araLimitStr}%</div>
                        </div>
                        <div className="col-span-4 text-right">
                            <div className="text-lg font-black text-red-500/80">{row.arb}</div>
                            <div className="text-[10px] font-bold text-red-500/50">-{row.arbLimitStr}%</div>
                        </div>
                    </div>
                ))}
             </div>

             <div className="mt-8 p-6 bg-[rgba(58,123,213,0.05)] rounded-2xl border border-[rgba(58,123,213,0.1)]">
                <p className="text-[11px] leading-relaxed text-[#3a7bd5] font-medium opacity-90">
                    <span className="font-bold underline">Note:</span> Auto Rejection limits are symmetrical (35% &lt; 200, 25% 200-5000, 20% &gt; 5000). Prices are rounded to the nearest tick fraction.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
