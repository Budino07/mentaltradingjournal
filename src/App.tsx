
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Backtesting from "./pages/Backtesting";
import BlueprintSessions from "./pages/BlueprintSessions";
import Notebook from "./pages/Notebook";
import Login from "./pages/Login";
import MfeMae from "./pages/MfeMae";
import TradesList from "./pages/TradesList";
import MentalWrapped from "./pages/MentalWrapped";
import News from "./pages/News";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { useIsAdmin } from "./hooks/useAdmin";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AdminGrowth from "./pages/admin/Growth";
import AdminEngagement from "./pages/admin/Engagement";
import AdminRetention from "./pages/admin/Retention";
import AdminUsers from "./pages/admin/Users";
import AdminAcquisition from "./pages/admin/Acquisition";
import AdminFunnel from "./pages/admin/Funnel";
import AdminMonetization from "./pages/admin/Monetization";
import AdminTakeaways from "./pages/admin/Takeaways";
import AdminTraders from "./pages/admin/Traders";
import AdminTraderDetail from "./pages/admin/TraderDetail";
import { AnalyticsTracker } from "./components/analytics/AnalyticsTracker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <NotificationsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <AnalyticsTracker />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/journal-entry"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Journal />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/trades"
                      element={
                        <ProtectedRoute>
                          <TradesList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/backtesting"
                      element={
                        <ProtectedRoute>
                          <Backtesting />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mfe-mae"
                      element={
                        <ProtectedRoute>
                          <MfeMae />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mental-wrapped"
                      element={
                        <ProtectedRoute>
                          <MentalWrapped />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/news"
                      element={
                        <ProtectedRoute>
                          <News />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notebook"
                      element={
                        <ProtectedRoute>
                          <Notebook />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blueprint/:blueprintId"
                      element={
                        <ProtectedRoute>
                          <BlueprintSessions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      <Route index element={<AdminOverview />} />
                      <Route path="acquisition" element={<AdminAcquisition />} />
                      <Route path="growth" element={<AdminGrowth />} />
                      <Route path="engagement" element={<AdminEngagement />} />
                      <Route path="retention" element={<AdminRetention />} />
                      <Route path="funnel" element={<AdminFunnel />} />
                      <Route path="monetization" element={<AdminMonetization />} />
                      <Route path="takeaways" element={<AdminTakeaways />} />
                      <Route path="traders" element={<AdminTraders />} />
                      <Route path="traders/:userId" element={<AdminTraderDetail />} />
                      <Route path="users" element={<AdminUsers />} />return
                    </Route>
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
