import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { TradingAccountProvider } from "./contexts/TradingAccountContext";

// Import your pages here
import Home from "./pages/Home";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Backtesting from "./pages/Backtesting";
import MFE_MAE from "./pages/MFE_MAE";
import Settings from "./pages/Settings";
import Features from "./pages/Features";
import JournalEntry from "./pages/JournalEntry";
import Notebook from "./pages/Notebook";
import TradesList from "./pages/TradesList";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <TradingAccountProvider>
            <NotificationsProvider>
              <Toaster position="top-center" />
              <Routes>
                {/* Define your routes here */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/backtesting" element={<Backtesting />} />
                <Route path="/mfe-mae" element={<MFE_MAE />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/features" element={<Features />} />
                <Route path="/journal-entry" element={<JournalEntry />} />
                <Route path="/notebook" element={<Notebook />} />
                <Route path="/trades" element={<TradesList />} />
              </Routes>
            </NotificationsProvider>
          </TradingAccountProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
