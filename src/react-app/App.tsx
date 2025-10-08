import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import DashboardPage from "@/react-app/pages/Dashboard";
import SimpleLoginPage from "@/react-app/pages/SimpleLogin";
import StaffManagementPage from "@/react-app/pages/StaffManagement";
import POSPage from "@/react-app/pages/POS";
import MenuManagementPage from "@/react-app/pages/MenuManagement";
import TablesManagementPage from "@/react-app/pages/TablesManagement";
import AnalyticsPage from "@/react-app/pages/Analytics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<SimpleLoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/menu" element={<MenuManagementPage />} />
        <Route path="/tables" element={<TablesManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}
