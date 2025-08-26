import React from "react";
import { useState, useEffect } from "react";
import {
  User,
  Save,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Settings,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const ProfilePage: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    if (user && !isFormInitialized) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      });
      setIsFormInitialized(true);
    }
  }, [user, isFormInitialized]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateUser(formData);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setIsFormInitialized(false); // Allow re-initialization with new data
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="theme-page border rounded-3xl border-neutral-700">
      <div className=" text-white">
        <div className="theme-container theme-bg-gradient py-12 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 theme-bg-glass rounded-full flex items-center justify-center shadow-xl">
                <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              {user.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-success-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-xl text-white/80 mb-4">@{user.username}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="theme-container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="theme-card">
              <div className="theme-card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold theme-text-primary">
                    Account Status
                  </h3>
                  <UserCheck className="w-6 h-6 theme-text-muted" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Verification</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`theme-status-dot ${
                          user.isVerified ? "bg-success-500" : "bg-warning-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          user.isVerified
                            ? "text-success-600"
                            : "text-warning-600"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Account Type</span>
                    <span className="text-sm font-medium theme-text-primary">
                      Standard
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-card">
              <div className="theme-card-body">
                <h3 className="text-lg font-semibold theme-text-primary mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Member Since</span>
                    <span className="text-sm font-medium theme-text-primary">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="theme-text-secondary">Last Updated</span>
                    <span className="text-sm font-medium theme-text-primary">
                      Today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="theme-card">
              <div className="theme-card-body">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="theme-icon-container-primary">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold theme-text-primary">
                      Edit Profile
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {message.text && (
                    <div
                      className={`theme-alert ${
                        message.type === "success"
                          ? "theme-alert-success"
                          : "theme-alert-error"
                      }`}
                    >
                      <p className="font-medium">{message.text}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="theme-label">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="theme-input"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="theme-label">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="theme-input"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="theme-label">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="theme-input"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    <p className="theme-help">
                      This will be your unique identifier
                    </p>
                  </div>

                  <div className="pt-6 border-t border-neutral-600">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="theme-btn-primary w-full md:w-auto px-8 py-3"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
