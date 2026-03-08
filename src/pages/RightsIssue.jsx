import React from 'react';
import { Briefcase } from 'lucide-react';

export default function RightsIssue() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center p-12 text-center h-[60vh] bg-[#131a26] rounded-[32px] border border-[#1e293b] shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(58,123,213,0.1)] flex items-center justify-center mb-6">
        <Briefcase className="w-8 h-8 text-[#3a7bd5]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Rights Issue Simulator</h2>
      <p className="text-text-muted mt-2 max-w-md">
        This feature is currently under development. Please check back later for the dilution simulator.
      </p>
    </div>
  );
}
