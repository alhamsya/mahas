import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import AverageCalculator from '../pages/AverageCalculator';
import ProfitCalculator from '../pages/ProfitCalculator';
import PyramidCalculator from '../pages/PyramidCalculator';
import PositionSizingCalculator from '../pages/PositionSizingCalculator';
import RiskRewardCalculator from '../pages/RiskRewardCalculator';
import DividendCalculator from '../pages/DividendCalculator';
import MSCIScreener from '../pages/MSCIScreener';
import RightsIssue from '../pages/RightsIssue';

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/average-price" element={<AverageCalculator />} />
        <Route path="/profit" element={<ProfitCalculator />} />
        <Route path="/pyramid" element={<PyramidCalculator />} />
        <Route path="/position-sizing" element={<PositionSizingCalculator />} />
        <Route path="/risk-reward" element={<RiskRewardCalculator />} />
        <Route path="/dividend" element={<DividendCalculator />} />
        <Route path="/rights-issue" element={<RightsIssue />} />
        <Route path="/msci-screener" element={<MSCIScreener />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/*" element={<DashboardRoutes />} />
    </Routes>
  );
}
