import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, X, Layers, Download, Upload, Trash2, ArrowRight, HelpCircle, RotateCcw, Info, GraduationCap, BookOpen } from 'lucide-react';
import BrokerFeeCard from '../components/BrokerFeeCard';

export default function PyramidCalculator() {
   const [invested, setInvested] = useState('50000000');
   const [riskPercent, setRiskPercent] = useState('2');
   const [entryPrice, setEntryPrice] = useState('120');
   const [stopLoss, setStopLoss] = useState('100');

   const [includeFees, setIncludeFees] = useState(true);
   const [buyFee, setBuyFee] = useState('0.15');
   const [sellFee, setSellFee] = useState('0.25');

   const [layers, setLayers] = useState([]);
   const [showHelpModal, setShowHelpModal] = useState(false);
   const [manualBaseLots, setManualBaseLots] = useState('');
   const PERCENT_SEQUENCE = [23.6, 38.2, 50, 61.8, 78.6, 100, 161.8, 261.8, 423.6, 685.4];

   const handleReset = () => {
      setInvested('');
      setRiskPercent('');
      setEntryPrice('');
      setStopLoss('');
      setIncludeFees(true);
      setBuyFee('0.15');
      setSellFee('0.25');
      setLayers([]);
   };

   // Handle number formatting with cursor preservation
   const handleNumericalChange = (setter, value, element) => {
      const cursor = element.selectionStart;
      const oldVal = element.value;
      const digitsBefore = oldVal.substring(0, cursor).replace(/,/g, '').length;

      const rawVal = value.replace(/,/g, '');
      if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
         setter(rawVal);
      }

      requestAnimationFrame(() => {
         const newVal = element.value;
         let newCursor = 0;
         let charsFound = 0;
         for (let i = 0; i < newVal.length; i++) {
            if (charsFound === digitsBefore) break;
            if (newVal[i] !== ',') charsFound++;
            newCursor = i + 1;
         }
         try {
            element.setSelectionRange(newCursor, newCursor);
         } catch (e) {
            // Ignore selection error on blur
         }
      });
   };

   const updateLayer = (id, field, value, element) => {
      if (field === 'isActive') {
         setLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
         return;
      }

      const cursor = element?.selectionStart || 0;
      const oldVal = element?.value || '';
      const digitsBefore = oldVal.substring(0, cursor).replace(/,/g, '').length;

      const rawVal = value.replace(/,/g, '');
      if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
         setLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: rawVal } : l));
      }

      if (element) {
         requestAnimationFrame(() => {
            const newVal = element.value;
            let newCursor = 0;
            let charsFound = 0;
            for (let i = 0; i < newVal.length; i++) {
               if (charsFound === digitsBefore) break;
               if (newVal[i] !== ',') charsFound++;
               newCursor = i + 1;
            }
            try {
               element.setSelectionRange(newCursor, newCursor);
            } catch (e) { }
         });
      }
   };

   const formatInputValue = (val) => {
      if (val === undefined || val === null) return '';
      const strVal = String(val);
      if (!strVal) return '';

      const parts = strVal.split('.');
      let wholePart = parts[0] || '';
      const decimalPart = parts[1];

      wholePart = wholePart.replace(/\D/g, '');
      const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      if (strVal.endsWith('.')) return `${formattedWhole}.`;
      if (decimalPart !== undefined) return `${formattedWhole}.${decimalPart.replace(/\D/g, '')}`;
      return formattedWhole;
   };

   const formatIDR = (val) => {
      return Number(val).toLocaleString('id-ID', { maximumFractionDigits: 0 });
   };

   // derived state for risk sizing
   const investedNum = Number(invested) || 0;
   const riskNum = Number(riskPercent) || 0;
   const entryNum = Number(entryPrice) || 0;
   const slNum = Number(stopLoss) || 0;

   const maxRiskAmount = investedNum * (riskNum / 100);
   const riskPerShare = entryNum - slNum;

    const bFeePercent = includeFees ? (Number(buyFee) || 0) / 100 : 0;
    
    // Position Sizing Logic (Base Entry)
    const computedBaseLots = riskPerShare > 0 ? Math.floor((maxRiskAmount / riskPerShare) / 100) : 0;
    const maxAffordableBaseLots = (entryNum > 0) ? Math.floor(investedNum / (entryNum * 100 * (1 + bFeePercent))) : 0;
    
    const baseLots = manualBaseLots !== '' 
       ? Math.min(Number(manualBaseLots) || 0, maxAffordableBaseLots) 
       : Math.min(computedBaseLots, maxAffordableBaseLots);

    const maxLossRp = baseLots * 100 * riskPerShare;

    // Execution Plan Memo
    const executionPlan = useMemo(() => {
       let currentLots = baseLots;
       let totalValueRaw = baseLots * 100 * entryNum;
       let plan = [{ 
          id: 'base', 
          stage: 'First Entry', 
          price: entryNum, 
          lots: baseLots, 
          avgPrice: entryNum, 
          isBase: true, 
          isActive: true 
       }];
       
       layers.forEach((layer, index) => {
          const lPrice = Number(layer.price) || 0;
          const lLots = Number(layer.lots) || 0;
          const isActive = layer.isActive !== false;
          
          if (isActive) {
             currentLots += lLots;
             totalValueRaw += lLots * 100 * lPrice;
          }
          
          plan.push({
             ...layer,
             stage: `Layer ${index + 1}`,
             price: layer.price,
             lots: layer.lots,
             avgPrice: (currentLots > 0 && isActive) ? (totalValueRaw / (currentLots * 100)) : 0,
             isBase: false,
             isActive: isActive
          });
       });

       return { plan, finalLots: currentLots, finalTotalValue: totalValueRaw };
    }, [baseLots, entryNum, layers]);

    const { plan: tableRows, finalLots, finalTotalValue } = executionPlan;

    // Financial Metrics
    const finalAvgPrice = finalLots > 0 ? finalTotalValue / (finalLots * 100) : 0;
    const totalCostWithFees = finalTotalValue * (1 + bFeePercent);
    const tradingBalance = investedNum - totalCostWithFees;

    // Budget Guard & Layer Management
    const nextLayerIdx = layers.length;
    const nextN = nextLayerIdx + 1;
    const nextAutoPriceNum = entryNum > 0 ? Math.round(entryNum * Math.pow(0.95, nextN)) : 0;
    const costForOneLot = nextAutoPriceNum > 0 ? (100 * nextAutoPriceNum * (1 + bFeePercent)) : 0;
    const canAddLayer = (investedNum > 0) && (tradingBalance > 0) && (costForOneLot === 0 || tradingBalance >= costForOneLot);

    const addLayer = () => {
       if (!canAddLayer) return;
       
       const autoPrice = nextAutoPriceNum > 0 ? nextAutoPriceNum : '';
       const pct = PERCENT_SEQUENCE[nextLayerIdx] || 1;
       const desiredLots = baseLots > 0 ? Math.floor(baseLots * (pct / 100)) : 0;

       // Capital Guard: Ensure we don't exceed trading balance
       const maxAllowedLots = costForOneLot > 0 ? Math.floor(tradingBalance / costForOneLot) : 0;
       const finalLots = Math.min(desiredLots, maxAllowedLots);
       
       setLayers([...layers, { 
          id: Math.random().toString(), 
          price: autoPrice.toString(), 
          lots: finalLots > 0 ? finalLots.toString() : '0', 
          isActive: true 
       }]);
    };

   const removeLayer = (id) => {
      setLayers(layers.filter(l => l.id !== id));
   };

   return (
      <>
         <div className="animate-fade-in space-y-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               {/* Left: Risk Sizing */}
               <div className="lg:col-span-7 bg-[#1E2A3B] rounded-2xl border border-[#1e293b] p-6 shadow-xl flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-sm font-bold text-white select-none">Risk Sizing</h2>
                     <div className="flex items-center gap-4">
                        <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-[#a0aec0] hover:text-white transition-colors">
                           <HelpCircle className="w-4 h-4" /> Bantuan
                        </button>
                        <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-xs font-bold text-[#a0aec0] hover:text-white transition-colors">
                           <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                     </div>
                  </div>

               <div className="space-y-4 flex-1">
                  {/* Total Capital */}
                  <div className="bg-[#0F1623] border border-[#2d3748] rounded-xl p-4 transition-colors focus-within:border-[#475569]">
                     <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Total Capital</label>
                     <input
                        type="text"
                        inputMode="decimal"
                        value={formatInputValue(invested)}
                        onChange={(e) => handleNumericalChange(setInvested, e.target.value, e.target)}
                        className="w-full bg-transparent text-[22px] text-white font-bold outline-none placeholder-[#334155]"
                        placeholder="0"
                     />
                  </div>

                  {/* Risk Per Trade & Stop Loss */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#0F1623] border border-[#2d3748] rounded-xl p-4 transition-colors focus-within:border-[#475569]">
                        <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Risk Per Trade (%)</label>
                        <input
                           type="text"
                           inputMode="decimal"
                           value={formatInputValue(riskPercent)}
                           onChange={(e) => handleNumericalChange(setRiskPercent, e.target.value, e.target)}
                           className="w-full bg-transparent text-[22px] text-white font-bold outline-none placeholder-[#334155]"
                           placeholder="0"
                        />
                     </div>
                     <div className="bg-[#0F1623] border border-[#2d3748] rounded-xl p-4 transition-colors focus-within:border-[#475569]">
                        <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Stop Loss</label>
                        <input
                           type="text"
                           inputMode="decimal"
                           value={formatInputValue(stopLoss)}
                           onChange={(e) => handleNumericalChange(setStopLoss, e.target.value, e.target)}
                           className="w-full bg-transparent text-[22px] text-white font-bold outline-none placeholder-[#334155]"
                           placeholder="0"
                        />
                     </div>
                  </div>

                  {/* First Entry Price & First Entry Lots */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#0F1623] border border-[#2d3748] rounded-xl p-4 transition-colors focus-within:border-[#475569]">
                        <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">First Entry Price</label>
                        <input
                           type="text"
                           inputMode="decimal"
                           value={formatInputValue(entryPrice)}
                           onChange={(e) => handleNumericalChange(setEntryPrice, e.target.value, e.target)}
                           className="w-full bg-transparent text-[22px] text-white font-bold outline-none placeholder-[#334155]"
                           placeholder="0"
                        />
                     </div>
                      <div className="bg-[#0F1623] border border-[#2d3748] rounded-xl p-4 transition-colors focus-within:border-[#475569]">
                         <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">First Entry Lots</label>
                         <input
                            type="text"
                            inputMode="decimal"
                            value={manualBaseLots !== '' ? formatInputValue(manualBaseLots) : formatIDR(baseLots)}
                            onChange={(e) => handleNumericalChange(setManualBaseLots, e.target.value, e.target)}
                            className="w-full bg-transparent text-[22px] text-[#52FBA2] font-bold outline-none placeholder-[#334155]"
                            placeholder={baseLots.toString()}
                         />
                      </div>
                  </div>

                  {/* Bottom Text Line */}
                  <div className="flex justify-between items-center px-4 py-3 border border-[#2d3748] rounded-xl bg-[#0F1623] mt-2 h-14">
                     <div className="text-left flex flex-col justify-center h-full">
                        <p className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest leading-none mb-1">All in to Buy Lots</p>
                        <p className="text-sm font-bold text-white tracking-wide leading-none">{formatIDR(Math.floor(investedNum / (entryNum > 0 ? entryNum * 100 : 1)) || 0)} lots</p>
                     </div>
                     <div className="text-right flex flex-col justify-center h-full">
                        <p className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest leading-none mb-1">Max Loss</p>
                        <p className="text-sm font-bold text-red-500 tracking-wide leading-none">Rp {formatIDR(maxLossRp)}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-5 space-y-6 flex flex-col">
               {/* Broker Fee */}
               <BrokerFeeCard
                  includeFees={includeFees}
                  setIncludeFees={setIncludeFees}
                  buyFee={buyFee}
                  setBuyFee={setBuyFee}
                  sellFee={sellFee}
                  setSellFee={setSellFee}
                  formatInputValue={formatInputValue}
                  handleNumericalChange={handleNumericalChange}
               />

               {/* Summary */}
               <div className="bg-[#1E2A3B] rounded-2xl border border-[#1e293b] p-6 shadow-xl flex-1 flex flex-col">
                  <h2 className="text-sm font-bold text-white mb-6 text-center select-none">Summary</h2>

                  <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                     <div className="bg-transparent border border-[#2d3748] rounded-xl p-4 flex flex-col justify-center">
                        <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Total Position (lots)</label>
                        <p className="text-[20px] 2xl:text-2xl font-black text-white tracking-tight">{formatIDR(finalLots)}</p>
                     </div>
                     <div className="bg-transparent border border-[#2d3748] rounded-xl p-4 flex flex-col justify-center">
                        <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Final Average Price (Rp)</label>
                        <p className="text-[20px] 2xl:text-2xl font-black text-[#52FBA2] tracking-tight">{formatIDR(Math.round(finalAvgPrice))}</p>
                     </div>
                      <div className="bg-transparent border border-[#2d3748] rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
                         <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Trading Balance (Rp)</label>
                         <p className={`text-[20px] 2xl:text-2xl font-black tracking-tight ${tradingBalance >= 0 ? 'text-[#52FBA2]' : 'text-red-500'}`}>
                            {formatIDR(Math.max(0, tradingBalance))}
                         </p>
                         {tradingBalance < -1 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-bl-lg animate-pulse uppercase">
                               Over Budget
                            </div>
                         )}
                      </div>
                     <div className="bg-transparent border border-[#2d3748] rounded-xl p-4 flex flex-col justify-center">
                        <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Total Invested (Rp)</label>
                        <p className="text-[20px] 2xl:text-2xl font-black text-white tracking-tight">
                           {formatIDR(totalCostWithFees)}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Pyramid Execution Plan */}
         <div className="bg-[#1E2A3B] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 relative">
               <h2 className="text-[17px] font-bold text-white absolute left-1/2 -translate-x-1/2 select-none">Pyramid Execution Plan</h2>
               <div className="ml-auto relative z-10">
                  <button 
                     onClick={addLayer} 
                     disabled={!canAddLayer}
                     className={`border text-[11px] font-bold py-2.5 px-4 rounded-[12px] flex items-center gap-2 transition-all uppercase tracking-widest whitespace-nowrap ${
                        !canAddLayer 
                        ? 'bg-transparent border-red-500/30 text-red-500/50 cursor-not-allowed opacity-50' 
                        : 'bg-transparent hover:bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white cursor-pointer'
                     }`}
                  >
                     <Plus className="w-4 h-4" /> Add Layer
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full border-separate border-spacing-y-1 lg:border-spacing-y-1.5 text-left min-w-[600px] mt-2">
                  <thead>
                     <tr className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest">
                        <th className="p-2 pl-6 text-left w-[20%]">STAGE</th>
                        <th className="p-2 text-center w-[20%]">PRICE CONDITION</th>
                        <th className="p-2 text-center w-[20%]">LOTS (+/-)</th>
                        <th className="p-2 text-center w-[20%]">MARKET VALUE</th>
                        <th className="p-2 text-center w-[20%]">AVERAGE PRICE</th>
                        <th className="p-2 text-center text-[#a0aec0] w-12 pb-2">
                           <button
                              onClick={() => {
                                 setLayers([
                                    { id: `l1_${Math.random()}`, price: '', lots: '', isActive: true }
                                 ]);
                              }}
                              className="p-1 cursor-pointer hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center mx-auto"
                              title="Reset Execution Plan"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {tableRows.map((row, index) => {
                        let relPercent = 0;
                        if (!row.isBase && baseLots > 0) {
                           relPercent = Math.round((Number(row.lots) / baseLots) * 100);
                        }
                        
                        const isActiveRow = row.isActive !== false;
                        const marketValue = (Number(row.lots) || 0) * (Number(row.price) || 0) * 100;

                        return (
                           <tr key={row.id} className={`bg-[#0F1623] group hover:bg-[#131d2d] transition-colors rounded-[12px] ${isActiveRow ? '' : 'opacity-40 grayscale-[50%]'}`}>
                              {/* Stage Column */}
                              <td className="p-3 pl-6 rounded-l-[12px] border-r border-[#1e293b] align-middle">
                                 <div className="flex items-center gap-3">
                                    <input
                                       type="checkbox"
                                       checked={isActiveRow}
                                       onChange={(e) => !row.isBase && updateLayer(row.id, 'isActive', e.target.checked)}
                                       disabled={row.isBase}
                                       tabIndex={-1}
                                       className={`w-4 h-4 rounded cursor-pointer accent-[#52FBA2] shrink-0 ${row.isBase ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <span className="text-sm font-bold text-white whitespace-nowrap">{row.stage}</span>
                                 </div>
                              </td>

                              {/* Price Condition Column */}
                              <td className="p-0 border-r border-[#1e293b] align-middle text-center">
                                 {row.isBase ? (
                                    <div className="w-full text-center text-sm text-white font-bold p-2 sm:p-3 lg:p-4">
                                       <span className="text-xs text-[#a0aec0] opacity-70 tracking-widest mr-1">@</span>
                                       {formatIDR(row.price)}
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-center w-full px-2">
                                       <span className="text-[10px] tracking-widest text-[#a0aec0] opacity-70 mr-1">IF &gt;</span>
                                       <input
                                          type="text"
                                          inputMode="decimal"
                                          value={formatInputValue(row.price)}
                                          onChange={(e) => updateLayer(row.id, 'price', e.target.value, e.target)}
                                          className="w-16 sm:w-20 bg-transparent text-center text-sm text-white font-bold outline-none border-b border-[#334155] focus:border-[#52FBA2]/50 transition-colors py-1"
                                          placeholder="0"
                                          disabled={!isActiveRow}
                                       />
                                    </div>
                                 )}
                              </td>

                              {/* Lots Column */}
                              <td className="p-0 border-r border-[#1e293b] align-middle text-center">
                                 {row.isBase ? (
                                    <div className="w-full text-center text-sm text-white font-bold p-2 sm:p-3 lg:p-4">
                                       {formatIDR(row.lots)}
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-center w-full px-2 gap-2">
                                       <input
                                          type="text"
                                          inputMode="decimal"
                                          value={formatInputValue(row.lots)}
                                          onChange={(e) => updateLayer(row.id, 'lots', e.target.value, e.target)}
                                          className="w-16 sm:w-20 bg-transparent text-center text-sm text-white font-bold outline-none border-b border-[#334155] focus:border-[#52FBA2]/50 transition-colors py-1"
                                          placeholder="0"
                                          disabled={!isActiveRow}
                                       />
                                       <span className="text-[11px] text-[#a0aec0] opacity-50 font-normal tracking-wide">[{relPercent}%]</span>
                                    </div>
                                 )}
                              </td>

                              {/* Market Value Column */}
                              <td className="p-2 sm:p-3 lg:p-4 text-center border-r border-[#1e293b] align-middle">
                                 <span className="font-bold text-white tracking-wide">
                                    {marketValue > 0 ? formatIDR(marketValue) : '-'}
                                 </span>
                              </td>

                              {/* Avg Price Column */}
                              <td className="p-2 sm:p-3 lg:p-4 text-center border-r border-[#1e293b] align-middle">
                                 <span className="font-bold tracking-wide text-[#52FBA2]">
                                    {row.avgPrice > 0 ? `Rp ${formatIDR(Math.round(row.avgPrice))}` : '-'}
                                 </span>
                              </td>

                              {/* Trash Column */}
                              <td className="p-2 text-center align-middle rounded-r-[12px] relative w-12">
                                 {!row.isBase && (
                                    <button
                                       onClick={(e) => { e.stopPropagation(); removeLayer(row.id); }}
                                       tabIndex={-1}
                                       className="p-1.5 mx-auto text-[#334155] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 )}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
            </div>
         </div>

         {/* Help Modal */}
         {showHelpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B14]/80 backdrop-blur-sm">
               <div className="w-full max-w-2xl bg-[#1e293b] rounded-[15px] overflow-hidden border border-[#334155] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="bg-[#2d224b] px-6 py-5 border-b border-[#3b3259] relative">
                     <button
                        onClick={() => setShowHelpModal(false)}
                        className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                        title="Tutup Modal"
                     >
                        <X className="w-5 h-5" />
                     </button>
                     <div className="flex items-center gap-3 mb-1.5">
                        <GraduationCap className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Panduan Pyramid Scaling</h2>
                     </div>
                     <p className="text-sm text-gray-300">Cara memaksimalkan profit dengan strategi Pyramid Entry.</p>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                     {/* Seksi 1: Konsep Dasar */}
                     <div>
                        <div className="flex items-center gap-2.5 mb-3.5">
                           <BookOpen className="w-5 h-5 text-[#52FBA2]" />
                           <h3 className="text-[15px] font-bold text-white">Konsep Pyramid Scaling</h3>
                        </div>
                        <div className="space-y-3">
                           <div className="bg-[#0f1623] p-4 rounded-[16px] border border-[#1e293b]">
                              <p className="text-[13px] text-gray-400 leading-relaxed">
                                 Strategi menambah posisi (average up) ketika harga bergerak sesuai ekspektasi (untung). Kalkulator ini membantu menghitung lot yang harus dibeli di tiap target harga, sambil menjaga persentase maksimal risiko tetap aman berdasarkan batas stop loss Anda.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Seksi 2: Cara Menggunakan */}
                     <div>
                        <div className="flex items-center gap-2.5 mb-3.5">
                           <Info className="w-5 h-5 text-[#52FBA2]" />
                           <h3 className="text-[15px] font-bold text-white">Cara Membaca Kalkulator</h3>
                        </div>
                        <div className="bg-[#0f1623] p-4 rounded-[16px] border border-[#1e293b] space-y-3">
                           <p className="text-[13px] text-gray-400 leading-relaxed">
                              <strong className="text-[#52FBA2] font-semibold">Invested & Risk:</strong> Tentukan total modal (Invested) dan Persentase Risiko maksimal (misal 2% dari modal). Kalkulator akan mencari jumlah "Total Lots to Buy" aman untuk posisi awal (Base).
                           </p>
                           <p className="text-[13px] text-gray-400 leading-relaxed">
                              <strong className="text-[#52FBA2] font-semibold">Execution Plan:</strong> Ini tabel rencana entry Anda. Tambahkan layer baru jika ingin mengatur skenario target harga. Jika harga menyentuh kondisi "IF &gt;", Anda menyiapkan pembelian lot sekian persen dari posisi base. "Average Price" memantau berapa harga rata-rata secara riil setelah layer tersebut dieksekusi.
                           </p>
                        </div>
                     </div>

                     {/* Close Button CTA */}
                     <button
                        onClick={() => setShowHelpModal(false)}
                        className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold py-4 rounded-[16px] transition-colors shadow-lg mt-2"
                     >
                        Mengerti, Tutup Panduan
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
