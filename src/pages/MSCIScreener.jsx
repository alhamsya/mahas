import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Search, 
  Settings, 
  Columns, 
  CheckCircle2, 
  TrendingUp, 
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';

import { getMsciCandidates } from '../api/services';

const formatTrillion = (val) => {
  if (!val) return '0.00T';
  return (val / 1e12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'T';
};

export default function MSCIScreener() {
  const [activeTab, setActiveTab] = useState('Standard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateSelected, setDateSelected] = useState('06/03/2026');

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resData = await getMsciCandidates();
        if (!mounted) return;
        
        setApiData(resData.data || []);
        if (resData.date_selected) {
            // Convert YYYY-MM-DD to DD/MM/YYYY if needed, or just use as is
            const parts = resData.date_selected.split('-');
            if (parts.length === 3) {
                setDateSelected(`${parts[2]}/${parts[1]}/${parts[0]}`);
            } else {
                setDateSelected(resData.date_selected);
            }
        }
      } catch (err) {
        if (mounted) {
           setError(err.message || 'Failed to fetch API');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter data based on active tab and search query
  const filteredData = apiData.filter(item => {
      // Tab Category Match
      const matchesTab = activeTab === 'All' || 
                         item.member === activeTab || 
                         item.nearStatus === activeTab;
      
      // Search Match
      const matchesSearch = item.stockCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.stockName.toLowerCase().includes(searchQuery.toLowerCase());
                            
      return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#0b141e] text-white overflow-hidden rounded-xl border border-[#1e293b]">
      {/* Filters and Controls */}
      <div className="p-4 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Side Controls */}
        <div className="flex items-center gap-3">
          {/* Date Picker (Mock) */}
          <div className="flex items-center bg-[#152335] rounded-lg border border-[#1e293b] overflow-hidden">
             <div className="px-3 py-1.5 text-xs text-text-muted border-r border-[#1e293b]">DATE</div>
             <div className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 hover:bg-[#1e293b] cursor-pointer transition-colors">
                 {dateSelected}
                 <Calendar className="w-3.5 h-3.5 text-text-muted" />
             </div>
          </div>

          {/* Category Toggles */}
          <div className="flex items-center bg-[#152335] rounded-lg p-1 border border-[#1e293b]">
             {['Standard', 'Small Cap', 'Near Standard', 'Near Small Cap', 'All'].map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        activeTab === tab 
                            ? 'bg-[rgba(82,251,162,0.2)] text-[#52fba2] border border-[rgba(82,251,162,0.3)]' 
                            : 'text-text-muted hover:text-white hover:bg-[#1e293b]'
                    }`}
                 >
                     {tab === 'Standard' && <CheckCircle2 className="w-3.5 h-3.5" />}
                     {tab === 'All' && <Columns className="w-3.5 h-3.5" />}
                     {(tab === 'Near Standard' || tab === 'Near Small Cap') && <TrendingUp className="w-3.5 h-3.5" />}
                     {tab}
                 </button>
             ))}
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                    type="text" 
                    placeholder="Search price..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-[#152335] text-sm text-white rounded-lg pl-9 pr-4 py-1.5 border border-[#1e293b] focus:border-brand-green outline-none transition-colors placeholder:text-[#475569]"
                />
            </div>
            
            {/* Settings & Layout Toggles */}
            <button className="p-1.5 bg-[#152335] border border-[#1e293b] rounded-lg text-text-muted hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
            </button>
            <button className="p-1.5 bg-[#152335] border border-[#1e293b] rounded-lg text-text-muted hover:text-white transition-colors">
                <Columns className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="px-4 py-3 bg-[#0d1824] border-b border-[#1e293b] flex items-center justify-between">
          <div className="text-xs font-medium text-text-muted tracking-wide">
              TOTAL: <span className="text-white font-bold">{loading ? '-' : filteredData.length}</span> CANDIDATES
          </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-[#0b141e] sticky top-0 z-10 border-b border-[#1e293b]">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider font-sans">KODE</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">FULL MCAP <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#52fba2] uppercase tracking-wider text-right relative">
                 <div className="flex items-center justify-end gap-1">FREE FLOAT <br/> MCAP (IDX) <Info className="w-3 h-3 text-[#475569]" /></div>
                 <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#52fba2]/50"></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-white uppercase tracking-wider text-right">
                  <div className="flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3 text-brand-green" /> FREE <br/> FLOAT %
                  </div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">ATVR <br/> 3M <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">ATVR <br/> 12M <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">TRADING <br/> DAYS <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">FOT <br/> 12M <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">
                 <div className="flex items-center justify-center gap-1">SCORE ↓ <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">
                  <div className="flex items-center justify-center gap-1">POTENTIAL <br/> UPSIDE <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">
                   <div className="flex items-center justify-center gap-1">CATEGORY <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-left">
                  <div className="flex items-center gap-1">STATUS <Info className="w-3 h-3 text-[#475569]" /></div>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/50 relative">
            {loading && (
              <tr>
                <td colSpan="13" className="px-4 py-12 text-center">
                   <div className="flex flex-col items-center justify-center gap-3 text-text-muted">
                      <Loader2 className="w-8 h-8 animate-spin text-[#52fba2]" />
                      <p className="text-sm font-medium tracking-wide">Mengambil data dari server...</p>
                   </div>
                </td>
              </tr>
            )}
            
            {!loading && error && (
              <tr>
                <td colSpan="13" className="px-4 py-12 text-center">
                   <div className="flex flex-col items-center justify-center gap-3 text-red-400">
                      <AlertCircle className="w-8 h-8" />
                      <p className="text-sm font-medium tracking-wide">Gagal memuat data: {error}</p>
                   </div>
                </td>
              </tr>
            )}

            {!loading && !error && filteredData.length === 0 && (
              <tr>
                <td colSpan="13" className="px-4 py-12 text-center">
                   <p className="text-sm font-medium text-text-muted tracking-wide">Tidak ada data kandidat yang cocok.</p>
                </td>
              </tr>
            )}

            {!loading && !error && filteredData.map((item, idx) => (
              <tr key={item.stockCode || idx} className="hover:bg-[#152335]/50 transition-colors group">
                <td className="px-4 py-3.5">
                    <div className="font-bold text-[#52fba2] group-hover:text-[#52fba2] transition-colors">{item.stockCode}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{item.sector || item.stockName}</div>
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-white">{formatTrillion(item.fullMarketCap)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-[#52fba2]">{formatTrillion(item.freeFloatMarketCap)}</td>
                <td className="px-4 py-3.5 text-right font-medium text-white">{(item.freeFloatPct || 0).toFixed(1)}%</td>
                <td className="px-4 py-3.5 text-right text-text-muted">{(item.atvr3m || 0).toFixed(1)}%</td>
                <td className="px-4 py-3.5 text-right text-text-muted">{(item.atvr12m || 0).toFixed(1)}%</td>
                <td className="px-4 py-3.5 text-right text-text-muted">{item.tradedDays}/{item.totalDays}</td>
                <td className="px-4 py-3.5 text-right font-medium text-brand-green">{item.fot12m}%</td>
                <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-green/20 text-brand-green font-bold text-xs ring-1 ring-brand-green/30">
                        {item.proximityScore}
                    </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-green">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Met
                    </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1e293b] text-text-secondary border border-[#334155]">
                       {item.member || item.nearStatus}
                    </span>
                </td>
                <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-green whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.member ? `Masuk Kriteria ${item.member}` : 'Near Criteria'}
                    </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-[#52fba2] hover:bg-[rgba(82,251,162,0.1)] rounded transition-colors cursor-pointer">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-brand-green hover:bg-brand-green/10 rounded transition-colors">
                             <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
