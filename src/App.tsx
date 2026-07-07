/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import ApexBlack from "./components/ApexBlack";
import ApexBlue from "./components/ApexBlue";
import ApexGreen from "./components/ApexGreen";
import ApexRed from "./components/ApexRed";
import PickPlan from "./components/PickPlan";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import Auth from "./components/Auth";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ReviewBooster from "./components/ReviewBooster";
import RewardsBenefits from "./components/RewardsBenefits";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <ScrollToHash />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features/black" element={<ApexBlack />} />
          <Route path="/features/blue" element={<ApexBlue />} />
          <Route path="/features/green" element={<ApexGreen />} />
          <Route path="/features/red" element={<ApexRed />} />
          <Route path="/pricing" element={<PickPlan />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/review-booster" element={<ReviewBooster />} />
          <Route path="/rewards-benefits" element={<RewardsBenefits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
