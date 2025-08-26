import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authAPI } from "../../api/auth";
import LoadingSpinner from "../../components/LoadingSpinner";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authAPI.forgotPassword(email);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="theme-page-auth">
        <div className="max-w-md w-full text-center">
          <div className="theme-card">
            <div className="theme-card-body">
              <div className="w-16 h-16 theme-icon-container-success mx-auto mb-6 rounded-full">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold theme-text-primary mb-4">
                Check Your Email
              </h2>
              <p className="theme-text-secondary mb-6">
                If an account with that email exists, we've sent you a password
                reset link.
              </p>
              <Link to="/login" className="theme-btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page-auth">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-warning-600 to-warning-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold theme-text-primary mb-2">
            Forgot Password?
          </h2>
          <p className="theme-text-secondary">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="theme-card">
          <div className="theme-card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="theme-alert-error">{error}</div>}

              <div>
                <label htmlFor="email" className="theme-label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="theme-input pl-10"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full theme-btn-primary"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Link to="/login" className="theme-btn-link">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
