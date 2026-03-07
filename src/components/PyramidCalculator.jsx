import { useState, useMemo } from 'react';
import { Layers, HelpCircle, RotateCcw, Info, Plus } from 'lucide-react';

export default function PyramidCalculator() {
  const [capital, setCapital] = useState('100000000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [entryPrice, setEntryPrice] = useState('1000');
  const [stopLoss, setStopLoss] = useState('950');
  
  // Array of extra layers for the Pyramid Execution Plan
  const [layers, setLayers] = useState([
    { id: 1, price: '900', lots: '200' },
    { id: 2, price: '800', lots: '100' },
    { id: 3, price: '700', lots: '50' },
  ]);

  // Formatting utilities (matching Indonesian standard but parsed correctly)
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

  const handleNumericalChange = (setter, value, element) => {
    const cursor = element.selectionStart;
    const oldVal = element.value;
    const digitsBefore = oldVal.substring(0, cursor).replace(/\D/g, '').length;

    const rawVal = value.replace(/,/g, '');
    
    if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
        setter(rawVal);
    }

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

  const handleLayerChange = (id, field, value, element) => {
    const cursor = element.selectionStart;
    const oldVal = element.value;
    const digitsBefore = oldVal.substring(0, cursor).replace(/\D/g, '').length;

    const rawVal = value.replace(/,/g, '');
    
    if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: rawVal } : l));
    }

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

  const addLayer = () => {
    setLayers([...layers, { id: Date.now(), price: '', lots: '' }]);
  };

  const removeLayer = (id) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  const handleReset = () => {
    setCapital('');
    setRiskPercent('');
    setEntryPrice('');
    setStopLoss('');
    setLayers([]);
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
  };

  // Convert state strings to numbers
  const cap = Number(capital) || 0;
  const risk = Number(riskPercent) || 0;
  const entry = Number(entryPrice) || 0;
  const sl = Number(stopLoss) || 0;

  // Primary Risk Sizing Logic
  const riskAmount = cap * (risk / 100);
  const riskPerShare = entry - sl;
  
  let entryLots = 0;
  if (riskPerShare > 0) {
      entryLots = Math.floor(riskAmount / (riskPerShare * 100));
  }
  
  const maxLossAmount = entryLots * 100 * riskPerShare;

  // Formatted Input Values
  const displayCapital = formatInputValue(capital);
  const displayRisk = formatInputValue(riskPercent);
  const displayEntry = formatInputValue(entryPrice);
  const displaySL = formatInputValue(stopLoss);

  // Calculate Pyramid Execution Plan
  const planRows = useMemo(() => {
    const rows = [];
    
    // First row is the Initial Entry
    let cumLots = entryLots;
    let cumValue = entry * entryLots * 100;
    let avgPrice = entry;
    
    rows.push({
        id: 'entry',
        stage: 'Entry',
        priceLabel: `@ ${formatInputValue(entryPrice)}`,
        lotsDisplay: formatInputValue(entryLots),
        percentageText: null, // Initial entry is 100% implicitly
        avgPrice: avgPrice,
        isBase: true
    });

    // Subsequent Layers
    layers.forEach((layer, idx) => {
        const lPrice = Number(layer.price) || 0;
        const lLots = Number(layer.lots) || 0;
        
        let percentageText = '';
        if (entryLots > 0 && lLots > 0) {
            percentageText = `(${Math.round((lLots / entryLots) * 100)}%)`;
        } else if (lLots > 0) {
             percentageText = '(0%)';
        }

        if (lLots > 0 && lPrice > 0) {
            cumLots += lLots;
            cumValue += (lPrice * lLots * 100);
            avgPrice = cumLots > 0 ? cumValue / (cumLots * 100) : 0;
        }

        rows.push({
            id: layer.id,
            stage: `Layer ${idx + 1}`,
            layerData: layer,
            percentageText,
            avgPrice: Math.round(avgPrice),
            isBase: false
        });
    });

    return rows;
  }, [entryLots, entry, entryPrice, layers]);


  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Top Main Risk Sizing section */}
      <div className="bg-[#131a26] rounded-[32px] border border-[#1e293b] p-8 shadow-2xl relative max-w-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(58,123,213,0.1)] flex items-center justify-center">
              <span className="text-xl">📐</span>
            </div>
            <h2 className="text-lg font-bold text-[#00d2ff]">Risk Sizing</h2>
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
          {/* Total Capital */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Capital</label>
              <Info className="w-3.5 h-3.5 text-text-muted/50" />
            </div>
            <input 
              type="text"
              inputMode="decimal"
              value={displayCapital}
              onChange={(e) => handleNumericalChange(setCapital, e.target.value, e.target)}
              className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-[#00d2ff]/30 transition-all placeholder:text-[#1e293b]"
              placeholder="0"
            />
          </div>

          {/* Risk per Trade */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Risk per Trade (%)</label>
              <Info className="w-3.5 h-3.5 text-text-muted/50" />
            </div>
            <input 
              type="text"
              inputMode="decimal"
              value={displayRisk}
              onChange={(e) => handleNumericalChange(setRiskPercent, e.target.value, e.target)}
              className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-[#00d2ff]/30 transition-all placeholder:text-[#1e293b]"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Entry Price */}
             <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Entry Price</label>
                </div>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={displayEntry}
                  onChange={(e) => handleNumericalChange(setEntryPrice, e.target.value, e.target)}
                  className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-[#00d2ff]/30 transition-all placeholder:text-[#1e293b]"
                  placeholder="0"
                />
             </div>

             {/* Stop Loss */}
             <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-[#ff6b6b] uppercase tracking-wider">Stop Loss</label>
                </div>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={displaySL}
                  onChange={(e) => handleNumericalChange(setStopLoss, e.target.value, e.target)}
                  className="w-full bg-[#0f1623] border border-[#1e293b] rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-red-400/30 transition-all placeholder:text-[#1e293b]"
                  placeholder="0"
                />
             </div>
          </div>

          <div className="h-px bg-[#1e293b] my-6"></div>

          {/* Results Display */}
          <div className="flex justify-between items-end pb-2">
              <div className="text-sm font-medium text-text-muted">Total Lots to Buy</div>
              <div className="text-right">
                  <div className="text-4xl font-black text-white">{formatInputValue(entryLots)}</div>
                  <div className="text-xs font-bold text-[#ff6b6b] mt-1 text-right">Max Loss: {formatIDR(maxLossAmount)}</div>
              </div>
          </div>

        </div>
      </div>

      {/* Pyramid Execution Plan section */}
      <div className="bg-[#1a2332] rounded-[32px] border border-[#2d3748] p-8 shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-white tracking-wide">Pyramid Execution Plan</h2>
              <button 
                  onClick={addLayer}
                  className="flex items-center gap-2 px-4 py-2 bg-[rgba(0,210,255,0.1)] hover:bg-[rgba(0,210,255,0.15)] border border-[rgba(0,210,255,0.2)] rounded-xl text-sm font-bold text-[#00d2ff] transition-all"
              >
                  <Plus className="w-4 h-4" /> Add Layer
              </button>
          </div>

          <div className="space-y-2">
             {/* Table Header */}
             <div className="grid grid-cols-12 px-6 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-[#2d3748] mb-4">
                 <div className="col-span-3">Stage</div>
                 <div className="col-span-3">Price Condition</div>
                 <div className="col-span-3">Lots (+/-)</div>
                 <div className="col-span-3 text-right">Avg Price</div>
             </div>

             {/* Dynamic Rows */}
             {planRows.map((row) => (
                 <div key={row.id} className="grid grid-cols-12 items-center px-6 py-4 border-b border-[#2d3748]/50 hover:bg-[#202b3d] transition-colors group">
                     {/* Stage Name */}
                     <div className="col-span-3 font-bold text-sm">
                         {row.isBase ? (
                             <span className="text-[#00d2ff]">{row.stage}</span>
                         ) : (
                             <div className="flex items-center gap-2">
                                <span className="text-[#b588ff]">{row.stage}</span>
                                <button 
                                    onClick={() => removeLayer(row.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                                >
                                    ✕
                                </button>
                             </div>
                         )}
                     </div>

                     {/* Price Condition */}
                     <div className="col-span-3">
                         {row.isBase ? (
                             <span className="text-text-secondary text-sm">{row.priceLabel}</span>
                         ) : (
                             <div className="flex items-center text-sm font-medium text-text-muted">
                                 <span className="mr-2 text-[10px] tracking-widest opacity-50">IF &gt;</span>
                                 <input 
                                     type="text"
                                     value={formatInputValue(row.layerData.price)}
                                     onChange={(e) => handleLayerChange(row.id, 'price', e.target.value, e.target)}
                                     className="w-24 bg-transparent border-b border-[#3a4b66] focus:border-[#00d2ff] py-1 text-white text-sm font-bold outline-none transition-colors"
                                     placeholder="0"
                                 />
                             </div>
                         )}
                     </div>

                     {/* Lots */}
                     <div className="col-span-3 flex items-center gap-3">
                         {row.isBase ? (
                             <span className="text-white font-black">{row.lotsDisplay}</span>
                         ) : (
                             <div className="flex items-center gap-3">
                                <input 
                                     type="text"
                                     value={formatInputValue(row.layerData.lots)}
                                     onChange={(e) => handleLayerChange(row.id, 'lots', e.target.value, e.target)}
                                     className="w-20 bg-transparent border-b border-[#3a4b66] focus:border-[#00d2ff] py-1 text-white font-black outline-none transition-colors"
                                     placeholder="0"
                                 />
                                 <span className="text-xs font-semibold text-text-muted/60">{row.percentageText}</span>
                             </div>
                         )}
                     </div>

                     {/* Avg Price */}
                     <div className="col-span-3 text-right">
                         <span className="text-white font-black font-mono tracking-wide">{formatInputValue(row.avgPrice)}</span>
                     </div>
                 </div>
             ))}

          </div>
      </div>
    </div>
  );
}
