"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  Key,
  Menu,
  X,
  Home,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const fadeInStyle: React.CSSProperties = {
    animation: isClosing
      ? "fadeOut 0.2s ease-out forwards"
      : "fadeIn 0.2s ease-out forwards",
  };

  const slideInRightStyle: React.CSSProperties = {
    animation: isClosing
      ? "slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
      : "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInRight {
        from { 
          transform: translateX(100%); 
          opacity: 0; 
        }
        to { 
          transform: translateX(0); 
          opacity: 1; 
        }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideOutRight {
        from { 
          transform: translateX(0); 
          opacity: 1; 
        }
        to { 
          transform: translateX(100%); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    closeMobileMenu();
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    closeMobileMenu();
    navigate("/profile");
  };

  const handleForgotPasswordClick = () => {
    setIsDropdownOpen(false);
    closeMobileMenu();
    navigate("/forgot-password");
  };

  const navigationLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dreams", href: "/dreams", icon: Sparkles },
  ];

  return (
    <>
      <nav className="theme-nav px-3 mb-5">
        <div className="theme-container">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center gap-3 group hover:opacity-90 transition-opacity duration-200"
              >
                <span className="font-bold text-2xl sm:text-2xl md:text-2xl theme-text-gradient whitespace-nowrap">
                  Dream Vault
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-8">
              <div className="flex items-center space-x-1 rounded-full p-1 border border-neutral-200/50">
                {navigationLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="theme-nav-link"
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all border border-neutral-200/50 hover:shadow-sm"
                  >
                    <div className="w-8 h-8 theme-bg-gradient rounded-full flex items-center justify-center ring-white shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-neutal-300 text-sm leading-tight">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="theme-dropdown">
                      <div className="px-4 py-3 border-b border-neutral-700">
                        <p className="text-sm font-semibold text-neutral-300">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          @{user?.username}
                        </p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={handleProfileClick}
                          className="theme-dropdown-item hover:bg-neutral-800"
                        >
                          <div className="theme-icon-container-neutral mr-3">
                            <Settings className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              Profile Settings
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={handleForgotPasswordClick}
                          className="theme-dropdown-item hover:bg-neutral-800"
                        >
                          <div className="theme-icon-container-neutral mr-3">
                            <Key className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Change Password</span>
                          </div>
                        </button>
                      </div>

                      <div className="theme-dropdown-divider pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-danger-600 theme-dropdown-item group hover:bg-neutral-800 hover:text-danger-500"
                        >
                          <div className="theme-icon-container-danger mr-3 hover:text-danger-600">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Sign Out</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="theme-btn-secondary">
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="theme-btn-primary shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:hidden">
              <button
                onClick={() =>
                  isMobileMenuOpen
                    ? closeMobileMenu()
                    : setIsMobileMenuOpen(true)
                }
                className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 border border-transparent hover:border-neutral-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          <div
            className="theme-mobile-overlay"
            style={fadeInStyle}
            onClick={closeMobileMenu}
          />

          <div className="theme-mobile-menu" style={slideInRightStyle}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 theme-bg-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DV</span>
                </div>
                <span className="font-bold text-lg theme-text-gradient">
                  Dream Vault
                </span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full overflow-y-auto">
              {/* User section (if authenticated) */}
              {isAuthenticated && (
                <div className="p-6 border-b border-neutral-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 theme-bg-gradient rounded-full flex items-center justify-center ring-2 ring-brand-100">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-lg">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        @{user?.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <div className="p-4">
                <div className="space-y-2">
                  {navigationLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="flex items-center px-4 py-4 text-neutral-700 hover:bg-neutral-50 transition-colors duration-200 rounded-xl group"
                        onClick={closeMobileMenu}
                      >
                        <div className="theme-icon-container-neutral mr-4">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-lg">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account actions (if authenticated) */}
              {isAuthenticated && (
                <div className="p-4 border-t border-neutral-100 mt-auto">
                  <div className="space-y-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center px-4 py-4 text-neutral-700 hover:bg-neutral-50 transition-colors duration-200 rounded-xl group"
                    >
                      <div className="theme-icon-container-neutral mr-4">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-lg">
                          Profile Settings
                        </span>
                        <span className="text-sm text-neutral-500">
                          Manage your account
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={handleForgotPasswordClick}
                      className="w-full flex items-center px-4 py-4 text-neutral-700 hover:bg-neutral-50 transition-colors duration-200 rounded-xl group"
                    >
                      <div className="theme-icon-container-neutral mr-4">
                        <Key className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-lg">
                          Change Password
                        </span>
                        <span className="text-sm text-neutral-500">
                          Update your password
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-4 text-danger-600 hover:bg-danger-50 transition-colors duration-200 rounded-xl group"
                    >
                      <div className="theme-icon-container-danger mr-4">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-lg">Sign Out</span>
                        <span className="text-sm text-danger-500">
                          End your session
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Auth buttons (if not authenticated) */}
              {!isAuthenticated && (
                <div className="p-4 border-t border-neutral-100 mt-auto">
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block w-full text-center theme-btn-secondary py-4 text-lg"
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-center theme-btn-primary py-4 text-lg"
                      onClick={closeMobileMenu}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
