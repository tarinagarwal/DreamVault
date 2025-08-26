import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircle, Mail, RefreshCw } from "lucide-react";
import { authAPI } from "../../api/auth";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (error) setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const inputToFocus = document.getElementById(`otp-${focusIndex}`);
    inputToFocus?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required. Please go back to signup.");
      return;
    }

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authAPI.verifyEmail(email, otpString);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email is required. Please go back to signup.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const result = await authAPI.resendOtp(email);

      if (result.success) {
        setOtp(["", "", "", "", "", ""]); // Clear current OTP
        // You could show a success message here
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
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
                Email Verified!
              </h2>
              <p className="theme-text-secondary mb-6">
                Your email has been successfully verified. Redirecting to
                login...
              </p>
              <LoadingSpinner size="md" />
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
          <div className="w-16 h-16 theme-bg-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold theme-text-primary mb-2">
            Verify Your Email
          </h2>
          <p className="theme-text-secondary mb-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-brand-600 font-medium">
            {email || "your email address"}
          </p>
        </div>

        <div className="theme-card">
          <div className="theme-card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="theme-alert-error">{error}</div>}

              <div>
                <label className="theme-label text-center block mb-4">
                  Enter Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
                    />
                  ))}
                </div>
                <p className="theme-help text-center mt-3">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full theme-btn-primary"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Verify Email"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="theme-text-secondary text-sm mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOtp}
                disabled={isResending}
                className="theme-btn-link disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/signup" className="theme-btn-link">
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
