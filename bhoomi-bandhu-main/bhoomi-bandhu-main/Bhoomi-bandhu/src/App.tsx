/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { SplashOnboardingPage } from "./pages/SplashOnboardingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WarehouseOwnerDashboardPage } from "./pages/WarehouseOwnerDashboardPage";
import { ServicesHubPage } from "./pages/ServicesHubPage";
import { SearchPage } from "./pages/SearchPage";
import { SchemesPage } from "./pages/SchemesPage";
import { SchemeDetailPage } from "./pages/SchemeDetailPage";
import { EligibilityCheckerPage } from "./pages/EligibilityCheckerPage";
import { WarehousesPage } from "./pages/WarehousesPage";
import { WarehouseDetailPage } from "./pages/WarehouseDetailPage";
import { BookingFormPage } from "./pages/BookingFormPage";
import { InsurancePage } from "./pages/InsurancePage";
import { LoansPage } from "./pages/LoansPage";
import { CropAdvisorPage } from "./pages/CropAdvisorPage";
import { AiChatPage } from "./pages/AiChatPage";
import { WellBeingPage } from "./pages/WellBeingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { HelpPage } from "./pages/HelpPage";
import { AdminPage } from "./pages/AdminPage";
import { PsychiatristPortalPage } from "./pages/PsychiatristPortalPage";
import { SupportEmployeePage } from "./pages/SupportEmployeePage";
import { ForcePasswordChangePage } from "./pages/ForcePasswordChangePage";
import { getDefaultRouteForRole } from "./utils/roles";
import { Sprout } from "lucide-react";

function AppRoutes() {
  const { user, profile, authReady, isAdmin } = useAuth();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center gap-3 text-[#2D6A4F]">
        <Sprout className="w-8 h-8 animate-pulse" />
        <p className="font-display font-semibold text-base text-[#1B2A20]">
          Loading BhoomiBandhu...
        </p>
      </div>
    );
  }

  // Auth-first experience: unauthenticated visitors land directly on Login & Sign-Up
  if (!user) {
    return (
      <Routes>
        <Route path="/onboarding" element={<SplashOnboardingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (profile?.mustChangePassword) {
    return (
      <Routes>
        <Route path="*" element={<ForcePasswordChangePage />} />
      </Routes>
    );
  }

  const defaultRoute = getDefaultRouteForRole(profile?.role, isAdmin);

  return (
    <Routes>
      {!isAdmin && <Route path="/onboarding" element={<SplashOnboardingPage />} />}
      <Route path="/auth" element={<Navigate to={defaultRoute} replace />} />
      <Route
        path="/*"
        element={
          <Layout>
            {isAdmin ? (
              <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="/psychiatrist"
                  element={<PsychiatristPortalPage />}
                />
                <Route path="/support-desk" element={<SupportEmployeePage />} />
                <Route
                  path="/notifications"
                  element={<NotificationsPage />}
                />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={
                    profile?.role === "psychiatrist" ? (
                      <Navigate to="/psychiatrist" replace />
                    ) : profile?.role === "support_staff" ? (
                      <Navigate to="/support-desk" replace />
                    ) : profile?.role === "warehouse_owner" ? (
                      <WarehouseOwnerDashboardPage />
                    ) : (
                      <DashboardPage />
                    )
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <WarehouseOwnerDashboardPage />
                    ) : (
                      <DashboardPage />
                    )
                  }
                />
                <Route
                  path="/services"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <ServicesHubPage />
                    )
                  }
                />
                <Route path="/search" element={<SearchPage />} />
                <Route
                  path="/schemes"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <SchemesPage />
                    )
                  }
                />
                <Route
                  path="/schemes/:id"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <SchemeDetailPage />
                    )
                  }
                />
                <Route
                  path="/eligibility"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <EligibilityCheckerPage />
                    )
                  }
                />
                <Route path="/warehouses" element={<WarehousesPage />} />
                <Route
                  path="/warehouses/:id"
                  element={<WarehouseDetailPage />}
                />
                <Route
                  path="/warehouses/:id/book"
                  element={<BookingFormPage />}
                />
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/loans" element={<LoansPage />} />
                <Route
                  path="/crop-advisor"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <CropAdvisorPage />
                    )
                  }
                />
                <Route
                  path="/chat"
                  element={
                    profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <AiChatPage />
                    )
                  }
                />
                <Route
                  path="/wellbeing"
                  element={
                    profile?.role === "psychiatrist" ? (
                      <Navigate to="/psychiatrist" replace />
                    ) : profile?.role === "warehouse_owner" ? (
                      <Navigate to="/" replace />
                    ) : (
                      <WellBeingPage />
                    )
                  }
                />
                <Route
                  path="/psychiatrist"
                  element={<PsychiatristPortalPage />}
                />
                <Route path="/support-desk" element={<SupportEmployeePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/notifications"
                  element={<NotificationsPage />}
                />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="*"
                  element={<Navigate to={defaultRoute} replace />}
                />
              </Routes>
            )}
          </Layout>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
