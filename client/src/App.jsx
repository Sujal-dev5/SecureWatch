import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./Layouts/MainLayout";
import ProtectedRoute from "./Components/ProtectedRoute";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Websites from "./Pages/Websites";
import Scans from "./Pages/Scans";
import ScanResults from "./Pages/ScanResults";
import SecurityOverview from "./Pages/SecurityOverview";
import Reports from "./Pages/Reports";
import ScanHistory from "./Pages/ScanHistory";
import AISecurityAnalysis from "./Pages/AISecurityAnalysis";
import Monitoring from "./Pages/Monitoring";
import Profile from "./Pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/websites"
            element={
              <ProtectedRoute>
                <Websites />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scans"
            element={
              <ProtectedRoute>
                <Scans />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scans/:scanId"
            element={
              <ProtectedRoute>
                <ScanResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scans/:scanId/intelligence"
            element={
              <ProtectedRoute>
                <SecurityOverview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scan-history"
            element={
              <ProtectedRoute>
                <ScanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scans/:scanId/ai"
            element={
              <ProtectedRoute>
                <AISecurityAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
           path="/monitoring"
           element={
             <ProtectedRoute>
               <Monitoring />
             </ProtectedRoute>
           }
          />
          <Route
           path="/profile"
           element={
             <ProtectedRoute>
               <Profile />
             </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
