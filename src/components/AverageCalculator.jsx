import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Scale, RotateCcw, HelpCircle, Plus, Info, Target, Banknote, Trash2, GraduationCap, BookOpen, X } from 'lucide-react';

export default function AverageCalculator() {
  const [activeTab, setActiveTab] = useState('blender'); // 'blender' | 'target'
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Initialize Blender State from Cookies or Default
  const getInitialPositions = () => {
    const saved = Cookies.get('avgCalc_positions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved positions', e);
      }
    }
    return [{ id: '1', price: '', lot: '', isActive: true }]; // Empty default state
  };

  const [positions, setPositions] = useState(getInitialPositions);

  // Initialize Target State from Cookies or Default
  const [targetCurrentAvg, setTargetCurrentAvg] = useState(() => Number(Cookies.get('avgCalc_tAvg')) || 0);
  const [targetTotalValue, setTargetTotalValue] = useState(() => Number(Cookies.get('avgCalc_tValue')) || 0);
  const [targetBudget, setTargetBudget] = useState(() => Number(Cookies.get('avgCalc_tBudget')) || 0);
  const [targetDesiredAvg, setTargetDesiredAvg] = useState(() => Number(Cookies.get('avgCalc_tDesired')) || 0);

  // Initialize Broker Fee State
  const [includeFees, setIncludeFees] = useState(() => Cookies.get('avgCalc_includeFees') === 'true');
  const [buyFee, setBuyFee] = useState(() => Cookies.get('avgCalc_buyFee') || '0.15');
  const [sellFee, setSellFee] = useState(() => Cookies.get('avgCalc_sellFee') || '0.25');

  // Synchronize State to Cookies
  useEffect(() => {
    Cookies.set('avgCalc_positions', JSON.stringify(positions), { expires: 30 }); // 30 days
  }, [positions]);

  useEffect(() => {
    Cookies.set('avgCalc_tAvg', targetCurrentAvg, { expires: 30 });
    Cookies.set('avgCalc_tValue', targetTotalValue, { expires: 30 });
    Cookies.set('avgCalc_tBudget', targetBudget, { expires: 30 });
    Cookies.set('avgCalc_tDesired', targetDesiredAvg, { expires: 30 });
  }, [targetCurrentAvg, targetTotalValue, targetBudget, targetDesiredAvg]);

  useEffect(() => {
    Cookies.set('avgCalc_includeFees', includeFees, { expires: 30 });
    Cookies.set('avgCalc_buyFee', buyFee, { expires: 30 });
    Cookies.set('avgCalc_sellFee', sellFee, { expires: 30 });
  }, [includeFees, buyFee, sellFee]);

  // Focus Management
  const [justAddedId, setJustAddedId] = useState(null);
  const priceInputRefs = useRef({});
  const lotInputRefs = useRef({});

  useEffect(() => {
    // Focus first row on initial load
    setTimeout(() => {
      if (positions.length > 0 && priceInputRefs.current[positions[0].id]) {
        priceInputRefs.current[positions[0].id].focus();
      }
    }, 100);
  }, []);

  useEffect(() => {
    // Focus newly added row
    if (justAddedId && priceInputRefs.current[justAddedId]) {
      setTimeout(() => {
        priceInputRefs.current[justAddedId]?.focus();
      }, 50);
      setJustAddedId(null);
    }
  }, [positions, justAddedId]);

  // Blender Handlers
  const handleAddPosition = () => {
    const newId = Math.random().toString();
    setPositions([...positions, { id: newId, price: '', lot: '', isActive: true }]);
    setJustAddedId(newId);
  };

  const handleRemovePosition = (idToRemove) => {
    setPositions(positions.filter(p => p.id !== idToRemove));
  };

  const toggleAllPositions = (isActiveStatus) => {
    setPositions(positions.map(p => ({ ...p, isActive: isActiveStatus })));
  };

  const handleKeyDown = (e, posId, field, index) => {
    // Only allow numbers, dot, and control keys. 
    // Prevent typing letters, commas (we let the formatter handle commas), etc
    const validKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '.', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Left', 'Right', 'Up', 'Down', 'Delete', 'Enter', 'Home', 'End'
    ];

    // Allow CMD/CTRL combinations (like Paste, Copy, Select All)
    if (!validKeys.includes(e.key) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowRight') {
      const input = e.target;
      if (input.selectionStart === input.value.length) {
        if (field === 'price') {
          lotInputRefs.current[posId]?.focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      const input = e.target;
      if (input.selectionStart === 0) {
        if (field === 'lot') {
          priceInputRefs.current[posId]?.focus();
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextPos = positions[index + 1];
      if (nextPos) {
        if (field === 'price') priceInputRefs.current[nextPos.id]?.focus();
        else if (field === 'lot') lotInputRefs.current[nextPos.id]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevPos = positions[index - 1];
      if (prevPos) {
        if (field === 'price') priceInputRefs.current[prevPos.id]?.focus();
        else if (field === 'lot') lotInputRefs.current[prevPos.id]?.focus();
      }
    }
  };

  const handleNumericalChange = (id, field, value, element) => {
    // 1. Capture current cursor and pure digits before it
    const cursor = element.selectionStart;
    const oldVal = element.value;
    const digitsBefore = oldVal.substring(0, cursor).replace(/\D/g, '').length;

    // 2. Update state
    updatePosition(id, field, value);

    // 3. In the next frame, restore cursor based on digits count
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

  const formatInputValue = (val) => {
    if (val === undefined || val === null) return '';
    const strVal = String(val);
    if (!strVal) return '';

    const parts = strVal.split('.');
    let wholePart = parts[0] || '';
    const decimalPart = parts[1];

    // Remove any non-digit chars from whole part
    wholePart = wholePart.replace(/\D/g, '');

    // Format whole part with commas every 3 digits
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (strVal.endsWith('.')) {
      return `${formattedWhole}.`;
    }

    if (decimalPart !== undefined) {
      // Remove any non-digits from decimal part
      const cleanDecimal = decimalPart.replace(/\D/g, '');
      return `${formattedWhole}.${cleanDecimal}`;
    }

    return formattedWhole;
  };

  const parseFormattedVal = (formattedStr) => {
    if (!formattedStr) return '';
    // Remove commas to get raw number string (allow dot)
    const rawNumStr = formattedStr.replace(/,/g, '');

    // Prevent multiple dots
    const parts = rawNumStr.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return rawNumStr;
  };

  const updatePosition = (id, field, value) => {
    const rawValue = (field === 'price' || field === 'lot') ? parseFormattedVal(value) : value;
    
    // Handle Target State Updates
    if (id === 'targetAvg') setTargetCurrentAvg(rawValue);
    else if (id === 'targetValue') setTargetTotalValue(rawValue);
    else if (id === 'targetBudget') setTargetBudget(rawValue);
    else if (id === 'targetDesired') setTargetDesiredAvg(rawValue);
    // Handle Blender State Updates
    else {
      setPositions(positions.map(p =>
        p.id === id ? { ...p, [field]: rawValue } : p
      ));
    }
  };

  // Blender Calculations
  const activePositions = positions.filter(p => p.isActive !== false && Number(p.lot) > 0 && Number(p.price) > 0);
  const totalShares = activePositions.reduce((acc, p) => acc + (Number(p.lot) * 100), 0);
  const totalValueRaw = activePositions.reduce((acc, p) => acc + (Number(p.price) * Number(p.lot) * 100), 0);

  const bFeeNum = includeFees ? (Number(buyFee) / 100) : 0;
  const sFeeNum = includeFees ? (Number(sellFee) / 100) : 0;

  const totalValue = totalValueRaw * (1 + bFeeNum);
  const totalLot = totalShares / 100;
  const averagePrice = totalShares > 0 ? (totalValue / totalShares) : 0;
  const rawAveragePrice = totalShares > 0 ? (totalValueRaw / totalShares) : 0;

  const breakEvenPrice = averagePrice / (1 - sFeeNum);

  // Target Calculations
  const targetCurrentLot = (Number(targetCurrentAvg) > 0 && Number(targetTotalValue) > 0) 
    ? Math.round(Number(targetTotalValue) / (Number(targetCurrentAvg) * 100)) 
    : 0;
  
  const targetCurrentValue = Number(targetTotalValue);
  
  const currentShares = targetCurrentLot * 100;
  const desiredAvg = Number(targetDesiredAvg);
  const budget = Number(targetBudget);
  const currentVal = Number(targetTotalValue);

  let newShares = 0;
  let requiredBuyPrice = 0;

  if (desiredAvg > 0) {
    // SharesBaru = (TotalValueLama + Budget - TargetAvg * TotalSharesLama) / TargetAvg
    newShares = (currentVal + budget - (desiredAvg * currentShares)) / desiredAvg;
    if (newShares > 0 && budget > 0) {
      // RequiredPrice * newShares * (1 + buyFee) = budget
      requiredBuyPrice = (budget / newShares) / (1 + bFeeNum);
    }
  }

  const formatIDR = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 flex space-x-2 bg-bg-card border border-[rgba(255,255,255,0.05)] p-1.5 rounded-[16px]">
        <button
          onClick={() => setActiveTab('blender')}
          className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all ${activeTab === 'blender' ? 'bg-[#252336] text-[#b78bf2] shadow-sm' : 'text-text-muted hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}
        >
          <Scale className="w-4 h-4" /> Position Blender
        </button>
        <button
          onClick={() => setActiveTab('target')}
          className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all ${activeTab === 'target' ? 'bg-[#252336] text-[#b78bf2] shadow-sm' : 'text-text-muted hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}
        >
          <Target className="w-4 h-4" /> Target Price
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-20">

        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 bg-[#1e293b] rounded-[24px] border border-[#2d3748] shadow-2xl p-4 sm:p-6 lg:p-8">

          {activeTab === 'blender' ? (
            // BLENDER VIEW
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(157,114,231,0.1)] flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#b78bf2]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#b78bf2]">Position Blender</h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                  <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 hover:text-white transition-colors"><HelpCircle className="w-3.5 h-3.5" /> Bantuan</button>
                  <button
                    onClick={() => {
                      setPositions([{ id: '1', price: '', lot: '', isActive: true }]);
                      Cookies.remove('avgCalc_positions');
                      setJustAddedId('1');
                    }}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>

              <div className="w-full overflow-x-auto text-[11px] sm:text-[13px] mb-6">
                <table className="w-full border-separate border-spacing-y-1 lg:border-spacing-y-1.5 text-left min-w-[360px]">
                  <thead>
                    <tr className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <th className="p-2 pl-5 text-center w-16">
                        <div className="flex flex-col items-center justify-center">
                          <input
                            type="checkbox"
                            onChange={(e) => toggleAllPositions(e.target.checked)}
                            checked={positions.length > 0 && positions.every(p => p.isActive !== false)}
                            tabIndex={-1}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-[#52FBA2]"
                          />
                        </div>
                      </th>
                      <th className="p-2 text-center w-8 font-mono">#</th>
                      <th className="p-2 text-center w-[25%]">PRICE</th>
                      <th className="p-2 text-center w-[20%]">LOTS</th>
                      <th className="p-2 text-center w-[45%]">VALUE</th>
                      <th className="p-2 text-center text-text-muted w-12 pb-2">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos, index) => {
                      const priceVal = Number(pos.price) || 0;
                      const lotVal = Number(pos.lot) || 0;
                      const rowValue = priceVal * lotVal * 100;
                      const isActiveRow = pos.isActive !== false;

                      return (
                        <tr key={pos.id} className={`bg-[#0f1623] group hover:bg-[#131d2d] transition-colors ${isActiveRow ? '' : 'opacity-40 grayscale-[50%]'}`}>
                          <td className="p-2 pl-5 text-center rounded-l-[12px] relative z-10 w-16">
                            <input
                              type="checkbox"
                              checked={isActiveRow}
                              onChange={(e) => updatePosition(pos.id, 'isActive', e.target.checked)}
                              tabIndex={-1}
                              className="w-4 h-4 rounded cursor-pointer accent-[#52FBA2]"
                              title="Sertakan posisi ini dalam kalkulasi"
                            />
                          </td>
                          <td className="p-2 text-center font-mono text-text-muted border-r border-[#1e293b]">
                            {index + 1}
                          </td>
                          <td className="p-0">
                            <input
                              ref={(el) => priceInputRefs.current[pos.id] = el}
                              type="text"
                              inputMode="decimal"
                              value={formatInputValue(pos.price)}
                              onChange={(e) => handleNumericalChange(pos.id, 'price', e.target.value, e.target)}
                              onKeyDown={(e) => handleKeyDown(e, pos.id, 'price', index)}
                              className="w-full bg-transparent text-center text-xs sm:text-sm text-white font-bold outline-none p-2 sm:p-3 lg:p-4 hover:bg-white/5 focus:bg-transparent"
                              placeholder="0"
                              disabled={!isActiveRow}
                            />
                          </td>
                          <td className="p-0 border-l border-[#1e293b]">
                            <input
                              ref={(el) => lotInputRefs.current[pos.id] = el}
                              type="text"
                              inputMode="decimal"
                              value={formatInputValue(pos.lot)}
                              onChange={(e) => handleNumericalChange(pos.id, 'lot', e.target.value, e.target)}
                              onKeyDown={(e) => {
                                handleKeyDown(e, pos.id, 'lot', index);
                                if (e.key === 'Tab' && !e.shiftKey) {
                                  if (index === positions.length - 1) {
                                    e.preventDefault();
                                    handleAddPosition();
                                  }
                                }
                              }}
                              className="w-full bg-transparent text-center text-xs sm:text-sm text-white font-bold outline-none p-2 sm:p-3 lg:p-4 hover:bg-white/5 focus:bg-transparent"
                              placeholder="0"
                              disabled={!isActiveRow}
                            />
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-center border-l border-[#1e293b]">
                            <span className={`font-bold tracking-wide ${rowValue > 0 ? 'text-white' : 'text-text-muted/30'}`}>
                              {`Rp ${formatIDR(rowValue)}`}
                            </span>
                          </td>
                          <td className="p-2 text-center align-middle rounded-r-[12px] border-l border-[#1e293b]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePosition(pos.id);
                              }}
                              tabIndex={-1}
                              className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mx-auto flex items-center justify-center cursor-pointer"
                              title="Hapus posisi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleAddPosition}
                className="w-full py-3.5 rounded-xl border border-dashed border-[#334155] text-[13px] font-bold text-text-muted hover:text-white hover:border-[#475569] hover:bg-[rgba(255,255,255,0.02)] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Position
              </button>
            </>
          ) : (
            // TARGET SIMULATOR VIEW (matching reference)
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#231d3b] flex items-center justify-center border border-[rgba(255,255,255,0.03)]">
                  <Target className="w-5 h-5 text-[#b78bf2]" />
                </div>
                <h2 className="text-lg font-bold text-[#b78bf2]">Target Simulator</h2>
              </div>

              {/* Current Position Group */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#334155]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#1e293b] text-[10px] font-bold uppercase tracking-widest text-[#64748b]">CURRENT POSITION</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-[#0f1623] rounded-xl p-4 border border-[rgba(255,255,255,0.02)]">
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">AVG PRICE</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatInputValue(targetCurrentAvg)}
                    onChange={(e) => handleNumericalChange('targetAvg', 'price', e.target.value, e.target)}
                    onKeyDown={(e) => handleKeyDown(e, 'targetAvg', 'price', 0)}
                    className="w-full bg-transparent text-lg text-white font-bold outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="bg-[#0f1623] rounded-xl p-4 border border-[rgba(255,255,255,0.02)]">
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">TOTAL VALUE (RP)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatInputValue(targetTotalValue)}
                    onChange={(e) => handleNumericalChange('targetValue', 'price', e.target.value, e.target)}
                    onKeyDown={(e) => handleKeyDown(e, 'targetValue', 'price', 0)}
                    className="w-full bg-transparent text-lg text-white font-bold outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-text-muted bg-[rgba(255,255,255,0.05)] inline-block px-3 py-1.5 rounded-full ml-auto float-right mb-6">
                Est. Output: <span className="text-white">{targetCurrentLot.toLocaleString('en-US')}</span> lots
              </div>
              <div className="clear-both"></div>

              {/* Target Plan Group */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#334155]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#1e293b] text-[10px] font-bold uppercase tracking-widest text-[#64748b]">TARGET PLAN</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0f1623] rounded-xl p-4 border border-[rgba(255,255,255,0.02)]">
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">NEW BUDGET (Dana Topup)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatInputValue(targetBudget)}
                    onChange={(e) => handleNumericalChange('targetBudget', 'price', e.target.value, e.target)}
                    onKeyDown={(e) => handleKeyDown(e, 'targetBudget', 'price', 0)}
                    className="w-full bg-transparent text-lg text-white font-bold outline-none"
                  />
                </div>

                <div className="bg-[rgba(157,114,231,0.05)] rounded-xl p-4 border border-[rgba(157,114,231,0.2)]">
                  <label className="block text-[10px] font-bold text-[#b78bf2] uppercase tracking-wider mb-2">TARGET AVERAGE PRICE</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatInputValue(targetDesiredAvg)}
                    onChange={(e) => handleNumericalChange('targetDesired', 'price', e.target.value, e.target)}
                    onKeyDown={(e) => handleKeyDown(e, 'targetDesired', 'price', 0)}
                    className="w-full bg-transparent text-lg text-white font-bold outline-none"
                  />
                </div>
              </div>
            </>
          )}

        </div>

        {/* Right Column: Output & Insights */}
        <div className="lg:col-span-5 space-y-4">

          {/* Shared Broker Fee Card */}
          <div className="bg-[#1e293b] rounded-[24px] border border-[rgba(255,255,255,0.05)] shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#b78bf2]" />
                <h3 className="text-[13px] font-bold text-white leading-none">Broker Fee</h3>
              </div>
              <button
                onClick={() => setIncludeFees(!includeFees)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${includeFees ? 'bg-[#b78bf2]' : 'bg-[#334155]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeFees ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-[#0f1623] rounded-xl p-3 border border-[rgba(255,255,255,0.02)] transition-opacity ${includeFees ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Fee Buy (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={buyFee}
                    onChange={(e) => setBuyFee(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full bg-transparent text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>
              <div className={`bg-[#0f1623] rounded-xl p-3 border border-[rgba(255,255,255,0.02)] transition-opacity ${includeFees ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Fee Sell (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={sellFee}
                    onChange={(e) => setSellFee(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full bg-transparent text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'blender' ? (
            // BLENDER OUTPUT
            <>
              <div className="bg-[#1e293b] rounded-[24px] border border-[rgba(255,255,255,0.05)] shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-8 right-8 text-brand-green/10 pointer-events-none">
                  <Target className="w-32 h-32" />
                </div>

                <div className="text-center mb-10 relative z-10">
                  <p className="text-[13px] font-medium text-white mb-2">Weighted Average Price</p>
                  <h3 className="text-[42px] font-black text-white tracking-tight leading-none drop-shadow-lg">
                    {averagePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </h3>
                </div>

                <div className="flex justify-between items-end border-t border-[#334155] pt-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">TOTAL LOTS</p>
                    <p className="text-[17px] font-bold text-white tracking-wide">{formatIDR(totalLot)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">TOTAL VALUE</p>
                    <p className="text-[17px] font-bold text-brand-green tracking-wide">Rp {formatIDR(totalValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] rounded-[24px] border border-[rgba(255,255,255,0.05)] shadow-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-[rgba(255,200,0,0.1)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></div>
                  </div>
                  <h3 className="text-[13px] font-bold text-white">Insights</h3>
                </div>

                <p className="text-sm text-text-muted mb-5">
                  You are combining <span className="font-bold text-white">{activePositions.length} positions</span>.
                </p>

                <div className="bg-[#111827] rounded-xl overflow-hidden divide-y divide-[#1e293b]">
                  <div className="flex justify-between items-center px-4 py-3.5 text-[13px]">
                    <span className="text-text-secondary">Break Even {includeFees ? '(incl. fees)' : '(est. 0.4% fee)'}</span>
                    <span className="text-brand-green font-bold text-sm">{breakEvenPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3.5 text-[13px]">
                    <span className="text-text-secondary">1% Profit Target</span>
                    <span className="text-brand-green font-bold text-sm">{(breakEvenPrice * 1.01).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // TARGET SIMULATOR OUTPUT
            <div className="bg-[#2B2745] rounded-[24px] border border-[rgba(255,255,255,0.05)] shadow-2xl p-8 relative flex flex-col justify-center min-h-[460px]">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 text-[#b78bf2] mb-3">
                  <Banknote className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">REQUIRED BUY PRICE</p>
                </div>

                <h3 className="text-[64px] font-black text-white tracking-tight leading-none drop-shadow-lg mb-6">
                  {requiredBuyPrice > 0 ? requiredBuyPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}
                </h3>

                <div className="inline-block bg-[#1f1635] text-white text-xs font-semibold px-4 py-2 rounded-full border border-[rgba(157,114,231,0.3)] shadow-[0_0_15px_rgba(157,114,231,0.2)]">
                  Buy at this price to hit avg <span className="font-bold text-[#e9d5ff]">{formatIDR(desiredAvg)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-[#1e1c2e] rounded-xl p-4 border border-[rgba(255,255,255,0.05)] text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">LOTS TO BUY</p>
                  <p className="text-lg font-bold text-white">{newShares > 0 ? formatIDR(newShares / 100) : '0'}</p>
                </div>
                <div className="bg-[#1e1c2e] rounded-xl p-4 border border-[rgba(255,255,255,0.05)] text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">NEW TOTAL LOTS</p>
                  <p className="text-lg font-bold text-white">{newShares > 0 ? formatIDR(Number(targetCurrentLot) + (newShares / 100)) : '0'}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B14]/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#1e293b] rounded-[24px] overflow-hidden border border-[#334155] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
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
                <h2 className="text-xl font-bold text-white">Average Calculator Guide</h2>
              </div>
              <p className="text-sm text-gray-300">Panduan lengkap Position Blender & Target Price</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Seksi 1: Mode Kalkulator */}
              <div>
                <div className="flex items-center gap-2.5 mb-3.5">
                  <BookOpen className="w-5 h-5 text-[#b78bf2]" />
                  <h3 className="text-[15px] font-bold text-white">Mode Kalkulator</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#0f1623] p-4 rounded-[16px] border border-[#1e293b]">
                    <h4 className="text-[14px] font-bold text-[#b78bf2] mb-1">Position Blender</h4>
                    <p className="text-[13px] text-gray-400 leading-relaxed">Hitung rata-rata harga (Average Price) dari beberapa posisi pembelian yang berbeda.</p>
                  </div>
                  <div className="bg-[#0f1623] p-4 rounded-[16px] border border-[#1e293b]">
                    <h4 className="text-[14px] font-bold text-[#b78bf2] mb-1">Target Price Simulator</h4>
                    <p className="text-[13px] text-gray-400 leading-relaxed">Cari tahu di harga berapa harus beli (Buy Price) untuk mencapai Target Average tertentu dengan budget yang ada.</p>
                  </div>
                </div>
              </div>

              {/* Seksi 2: Apa itu Average Up/Down? */}
              <div>
                <div className="flex items-center gap-2.5 mb-3.5">
                  <Info className="w-5 h-5 text-[#b78bf2]" />
                  <h3 className="text-[15px] font-bold text-white">Apa itu Average Up/Down?</h3>
                </div>
                <div className="bg-[#0f1623] p-4 rounded-[16px] border border-[#1e293b] space-y-3">
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    <strong className="text-[#b78bf2] font-semibold">Average Down:</strong> Membeli lebih banyak saham ketika harga turun untuk menurunkan harga rata-rata pembelian Anda.
                  </p>
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    <strong className="text-[#52FBA2] font-semibold">Average Up:</strong> Menambah posisi ketika harga naik, biasanya untuk menambah exposure pada saham yang menunjukkan momentum positif.
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
