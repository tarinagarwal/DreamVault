import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import DreamsPage from "./pages/DreamsPage";
import CreateDreamPage from "./pages/CreateDreamPage";
import DreamDetailPage from "./pages/DreamDetailPage";
import StoryViewPage from "./pages/StoryViewPage";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="theme-page p-3">
          <ScrollToTop />
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/verify-email"
              element={
                <PublicRoute>
                  <VerifyEmailPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/dreams" element={<DreamsPage />} />
            <Route
              path="/dreams/create"
              element={
                <ProtectedRoute>
                  <CreateDreamPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dreams/:id" element={<DreamDetailPage />} />
            <Route path="/dreams/:id/story" element={<StoryViewPage />} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
          <ScrollToTopButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
