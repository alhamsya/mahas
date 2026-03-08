import React from 'react';
import { Banknote } from 'lucide-react';

const BrokerFeeCard = ({ 
    includeFees, 
    setIncludeFees, 
    buyFee, 
    setBuyFee, 
    sellFee, 
    setSellFee,
    formatInputValue = (val) => val,
    handleNumericalChange = (setter, val, target) => {
        // Fallback simple numeric replacement if parent doesn't provide handleNumericalChange
        setter(val.replace(/[^0-9.]/g, ''));
    }
}) => {
    return (
        <div className="bg-[#1E2A3B] rounded-[15px] border border-[rgba(255,255,255,0.05)] shadow-xl p-6 w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#52FBA2]" />
                    <h3 className="text-[13px] font-bold text-white leading-none">Broker Fee</h3>
                </div>
                <button
                    onClick={() => setIncludeFees(!includeFees)}
                    className={`cursor-pointer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${includeFees ? 'bg-[#52FBA2]' : 'bg-[#334155]'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeFees ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className={`bg-[#0F1623] rounded-xl p-4 border border-[#2d3748] transition-all focus-within:border-[#475569] ${includeFees ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Fee Buy (%)</label>
                    <input 
                        type="text" 
                        inputMode="decimal"
                        value={formatInputValue(buyFee)} 
                        onChange={(e) => handleNumericalChange(setBuyFee, e.target.value, e.target)}
                        className="w-full bg-transparent text-lg text-white font-bold outline-none placeholder-[#334155]"
                        placeholder="0"
                    />
                </div>
                <div className={`bg-[#0F1623] rounded-xl p-4 border border-[#2d3748] transition-all focus-within:border-[#475569] ${includeFees ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <label className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest block mb-2">Fee Sell (%)</label>
                    <input 
                        type="text" 
                        inputMode="decimal"
                        value={formatInputValue(sellFee)} 
                        onChange={(e) => handleNumericalChange(setSellFee, e.target.value, e.target)}
                        className="w-full bg-transparent text-lg text-white font-bold outline-none placeholder-[#334155]"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
};

export default BrokerFeeCard;
