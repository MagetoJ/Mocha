import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import DashboardPage from "@/react-app/pages/Dashboard";
import SimpleLoginPage from "@/react-app/pages/SimpleLogin";
import StaffManagementPage from "@/react-app/pages/StaffManagement";
import POSPage from "@/react-app/pages/POS";
import MenuManagementPage from "@/react-app/pages/MenuManagement";
import TablesManagementPage from "@/react-app/pages/TablesManagement";
import AnalyticsPage from "@/react-app/pages/Analytics";
import WaiterDashboard from "@/react-app/pages/WaiterDashboard";
import ReceptionistDashboard from "@/react-app/pages/ReceptionistDashboard";
import KitchenDashboard from "@/react-app/pages/KitchenDashboard";
import AdminDashboard from "@/react-app/pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<POSPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<SimpleLoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
        <Route path="/reception-dashboard" element={<ReceptionistDashboard />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/menu" element={<MenuManagementPage />} />
        <Route path="/tables" element={<TablesManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}
