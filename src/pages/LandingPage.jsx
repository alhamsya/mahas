import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b141e] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 mb-8 rounded-2xl bg-transparent flex items-center justify-center shadow-lg overflow-hidden ring-4 ring-[#1e293b]">
        <img src="/hand.jpg" alt="Mahas Logo" className="w-full h-full object-cover" />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
        Welcome to <span className="text-brand-green">mahas.id</span>
      </h1>
      
      <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-12">
        Your comprehensive suite for IDX market screening, trading logic, and risk management analysis.
      </p>
      
      <Link 
        to="/average-price" 
        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#0b141e] bg-brand-green rounded-xl overflow-hidden transition-all hover:bg-[#52fba2]/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(82,251,162,0.3)] hover:shadow-[0_0_30px_rgba(82,251,162,0.5)]"
      >
        <span>Enter Dashboard</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
