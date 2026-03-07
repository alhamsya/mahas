import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Calculator, 
  Search, 
  Scale, 
  TrendingUp, 
  Layers, 
  Maximize, 
  ShieldQuestion, 
  CreditCard, 
  PieChart, 
  Briefcase 
} from 'lucide-react';

import AverageCalculator from './components/AverageCalculator';
import ProfitCalculator from './components/ProfitCalculator';
import PyramidCalculator from './components/PyramidCalculator';
import PositionSizingCalculator from './components/PositionSizingCalculator';
import RiskRewardCalculator from './components/RiskRewardCalculator';
import DividendCalculator from './components/DividendCalculator';

const NAV_GROUPS = [
  {
    title: "TRADING LOGIC",
    items: [
      { path: '/', label: 'Average Price', sub: 'Up/Down Simulator', icon: Scale },
      { path: '/profit', label: 'Profit & ARA/ARB', sub: 'Price Targets', icon: TrendingUp },
      { path: '/pyramid', label: 'Pyramid Entry', sub: 'Position Scaling', icon: Layers },
    ]
  },
  {
    title: "RISK MANAGEMENT",
    items: [
      { path: '/position-sizing', label: 'Position Sizing', sub: 'Calculate Lots', icon: Maximize },
      { path: '/risk-reward', label: 'Risk/Reward (R)', sub: 'R:R Ratio Analysis', icon: ShieldQuestion },
    ]
  },
  {
    title: "VALUE ANALYSIS",
    items: [
      { path: '/dividend', label: 'Dividend Calc', sub: 'Yield & BEP', icon: PieChart },
    ]
  },
  {
    title: "CORPORATE ACTIONS",
    items: [
      { path: '/rights-issue', label: 'Rights Issue', sub: 'Dilution Simulator', icon: Briefcase },
    ]
  }
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-bg-sidebar border-r border-[#1e293b] hidden md:flex flex-col h-full sticky top-0 overflow-y-auto">
      {/* App Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Kalkulator</h1>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">IDX Market Suite</p>
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari tools..." 
            className="w-full bg-[#1e293b] text-sm text-white rounded-lg pl-9 pr-4 py-2 border border-transparent focus:border-brand-green outline-none transition-colors placeholder:text-[#475569]"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-6 space-y-6">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2 px-3 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
              <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{group.title}</h2>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-[rgba(0,230,150,0.1)] border border-[rgba(0,230,150,0.2)]' 
                        : 'border border-transparent hover:bg-bg-card'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-brand-green' : 'bg-[#1e293b]'}`}>
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-bg-sidebar' : 'text-text-muted'}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isActive ? 'text-brand-green' : 'text-text-secondary'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">{item.sub}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  let activeTitle = "Average Price";
  let activeGroup = "TRADING LOGIC";
  
  NAV_GROUPS.forEach(group => {
    group.items.forEach(item => {
      if (item.path === currentPath) {
        activeTitle = item.label;
        activeGroup = group.title;
      }
    });
  });

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          {/* Top Breadcrumb Header matches reference exactly */}
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest mb-8">
            <span className="text-text-muted">{activeGroup}</span>
            <span className="text-text-muted/50 text-lg leading-none mt-[-2px]">›</span>
            <span className="text-brand-green tracking-widest">{activeTitle}</span>
          </div>

          <div className="mb-8 flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-[#0f1d2b] border border-[#1e293b] flex items-center justify-center">
                 {(() => {
                   const Icon = NAV_GROUPS.flatMap(g => g.items).find(i => i.label === activeTitle)?.icon || Scale;
                   return <Icon className="w-6 h-6 text-brand-green" />;
                 })()}
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{activeTitle}</h1>
                <p className="text-text-muted text-sm mt-1">
                  {NAV_GROUPS.flatMap(g => g.items).find(i => i.label === activeTitle)?.sub || 'Price Targets'}
                </p>
             </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AverageCalculator />} />
          <Route path="/profit" element={<ProfitCalculator />} />
          <Route path="/pyramid" element={<PyramidCalculator />} />
          <Route path="/position-sizing" element={<PositionSizingCalculator />} />
          <Route path="/risk-reward" element={<RiskRewardCalculator />} />
          <Route path="/dividend" element={<DividendCalculator />} />
        </Routes>
      </Layout>
    </Router>
  );
}
