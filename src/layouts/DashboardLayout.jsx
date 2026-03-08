import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Scale, 
  TrendingUp, 
  Layers, 
  Maximize, 
  ShieldQuestion, 
  PieChart, 
  Briefcase,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
} from 'lucide-react';

const SIDEBAR_STRUCTURE = [
  {
    title: "SPECIAL FEATURE",
    groups: [
      {
        title: null,
        items: [
          { path: '/msci-screener', label: 'MSCI Screener', sub: 'Index Candidates', icon: Maximize },
        ]
      }
    ]
  },
  {
    title: "TOOLS",
    groups: [
      {
        title: "TRADING LOGIC",
        items: [
          { path: '/average-price', label: 'Average Price', sub: 'Up/Down Simulator', icon: Scale },
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
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    'SPECIAL FEATURE': true,
    'TOOLS': true
  });

  const toggleSection = (title) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <aside className={`bg-bg-sidebar border-r border-[#1e293b] hidden md:flex flex-col h-full sticky top-0 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* App Logo and Profile */}
      <div className={`p-5 pb-2 border-b border-[#1e293b] mb-4 ${isSidebarCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center mb-5 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0 overflow-hidden group-hover:opacity-80 transition-opacity">
               <img src="/hand.jpg" alt="Mahas Logo" className="w-full h-full object-cover" />
            </div>
            {!isSidebarCollapsed && (
              <h1 className="text-[13px] font-bold text-text-muted tracking-[0.15em] uppercase mt-0.5 whitespace-nowrap group-hover:text-white transition-colors">mahas.id</h1>
            )}
          </Link>
          {/* Sidebar Toggle Button - Unified block with animation */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`cursor-pointer text-white hover:text-gray-300 transition-all duration-300 ${isSidebarCollapsed ? 'p-1.5 rounded hover:bg-[#1e293b]' : ''} ${isSidebarCollapsed ? 'mx-auto block' : ''}`}
          >
            <PanelLeftClose 
              className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`} 
              strokeWidth={2} 
            />
          </button>
        </div>
        
        {/* Only show login when NOT collapsed */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 mb-4">
            <button className="cursor-pointer flex-1 bg-transparent border border-[#334155] hover:bg-[#1e293b] text-white text-[11px] font-bold py-2 px-4 rounded-lg transition-colors tracking-widest uppercase">
              Login
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 pb-6 space-y-2 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
        {SIDEBAR_STRUCTURE.map((section, idx) => {
          const isOpen = openSections[section.title];
          
          return (
            <div key={idx} className="mb-1">
              {!isSidebarCollapsed && (
                <button 
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 cursor-pointer transition-colors group rounded-lg hover:bg-[#1e293b]/50"
                >
                  <h2 className="text-[11px] font-bold text-text-muted group-hover:text-white uppercase tracking-widest transition-colors mb-0 whitespace-nowrap">
                    {section.title}
                  </h2>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                  )}
                </button>
              )}
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out transform origin-top ${
                  (isOpen || isSidebarCollapsed) 
                    ? 'max-h-[2000px] opacity-100 scale-y-100 translate-y-0 mt-1' 
                    : 'max-h-0 opacity-0 scale-y-95 -translate-y-2'
                }`}
              >
                <div className="space-y-4 py-1">
                  {section.groups.map((group, groupIdx) => (
                    <div key={groupIdx}>
                      {group.title && !isSidebarCollapsed && (
                        <div className="flex items-center gap-2 px-3 mb-2 mt-1">
                          <TrendingUp className="w-3.5 h-3.5 text-text-muted/60" />
                          <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest whitespace-nowrap">{group.title}</h3>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              title={isSidebarCollapsed ? item.label : undefined}
                              className={`cursor-pointer flex items-center gap-3 py-2 rounded-xl transition-all duration-200 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} ${
                                isActive 
                                  ? 'bg-[rgba(0,230,150,0.1)] border border-[rgba(0,230,150,0.2)]' 
                                  : 'border border-transparent hover:bg-bg-card'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-brand-green' : 'bg-[#1e293b]'}`}>
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-bg-sidebar' : 'text-text-muted'}`} />
                              </div>
                              {!isSidebarCollapsed && (
                                <div>
                                  <div className={`text-sm font-semibold whitespace-nowrap ${isActive ? 'text-brand-green' : 'text-text-secondary'}`}>
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-text-muted mt-0.5 whitespace-nowrap">{item.sub}</div>
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  let activeTitle = "Average Price";
  let activeGroup = "TRADING LOGIC";
  let activeIcon = Scale;
  
  SIDEBAR_STRUCTURE.forEach(section => {
    section.groups.forEach(group => {
      group.items.forEach(item => {
        if (item.path === currentPath) {
          activeTitle = item.label;
          activeGroup = group.title || section.title;
          activeIcon = item.icon;
        }
      });
    });
  });

  const ActiveIconComponent = activeIcon;

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className={`${currentPath === '/msci-screener' ? 'w-full' : 'max-w-6xl'} mx-auto p-6 md:p-10 transition-all duration-300`}>
          
          {/* Top Breadcrumb Header matches reference exactly */}
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest mb-8">
            <span className="text-text-muted">{activeGroup}</span>
            <span className="text-text-muted/50 text-lg leading-none mt-[-2px]">›</span>
            <span className="text-brand-green tracking-widest">{activeTitle}</span>
          </div>

          <div className="mb-8 flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-[#0f1d2b] border border-[#1e293b] flex items-center justify-center">
                 <ActiveIconComponent className="w-6 h-6 text-brand-green" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{activeTitle}</h1>
                <p className="text-text-muted text-sm mt-1">
                  {SIDEBAR_STRUCTURE.flatMap(s => s.groups.flatMap(g => g.items)).find(i => i.label === activeTitle)?.sub || 'Price Targets'}
                </p>
             </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
