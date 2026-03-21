import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/authcontext";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRotue";
import Navbar from "./components/navbar";
import Profile from "./pages/profile";
import ConnectionPage from "./pages/connections/ConnectionPage";
import { useAuth } from "./context/authcontext";
import Sidebar from "./components/sidebar";
import BankAccountPage from "./pages/BankAccountPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import BankHistoryPage from "./pages/BankHistory.jsx";
import BankReverseEntriesPage from "./pages/BankReverseEntriesPage.jsx";
import TransactionReversePage from "./pages/TransactionReversePage.jsx";
import TransactionFlowChart from "./pages/Transactionflowchart.jsx";
import IPOPage from "./pages/IPOPage.jsx";
import PanManagerPage from "./pages/PanManagerPage.jsx";
import RoughNotesPage from "./pages/RoughNotesPage.jsx";
import RoughNoteDetails from "./pages/RoughNoteDetails.jsx";
import { useEffect } from "react";


const App = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Auth pages render standalone — no Navbar, no sidebar, no scroll wrapper
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  const { user } = useAuth();

  useEffect(() => {
    if (!sessionStorage.getItem("appLoaded")) {
      sessionStorage.setItem("appLoaded", "true");
      window.location.reload();
    }
  }, []);

  return (
    <div className="font-exo flex flex-col h-screen overflow-hidden bg-[#080808]">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 min-h-0 overflow-y-auto pb-24 md:pb-0">
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {user?.role === "admin" ? <AdminDashboard /> : <Dashboard />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <ProtectedRoute>
                  <ConnectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bankacc"
              element={
                <ProtectedRoute>
                  <BankAccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-history"
              element={
                <ProtectedRoute>
                  <BankHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-reverse-entries"
              element={
                <ProtectedRoute>
                  <BankReverseEntriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction-reverse-entries"
              element={
                <ProtectedRoute>
                  <TransactionReversePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactionsFlow"
              element={
                <ProtectedRoute>
                  <TransactionFlowChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipo"
              element={
                <ProtectedRoute>
                  <IPOPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pan-manager"
              element={
                <ProtectedRoute>
                  <PanManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rough-notes"
              element={
                <ProtectedRoute>
                  <RoughNotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rough-notes/:personId"
              element={
                <ProtectedRoute>
                  <RoughNoteDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
