import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, authAPI } from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message: string;
    requiresVerification?: boolean;
  }>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<{
    success: boolean;
    message: string;
    requiresVerification?: boolean;
  }>;
  logout: () => void;
  updateUser: (userData: {
    firstName: string;
    lastName: string;
    username: string;
  }) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Verify token is still valid by fetching fresh user data
          try {
            const response = await authAPI.getProfile();
            if (response.success && response.user) {
              setUser(response.user);
              localStorage.setItem("user", JSON.stringify(response.user));
            }
          } catch (error) {
            // Token is invalid, clear auth state
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return {
        success: response.success,
        message: response.message,
        requiresVerification: response.requiresVerification,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await authAPI.signup(userData);

      // If email verification is disabled, user is logged in immediately
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return {
        success: response.success,
        message: response.message,
        requiresVerification: response.requiresVerification,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = async (userData: {
    firstName: string;
    lastName: string;
    username: string;
  }) => {
    try {
      const response = await authAPI.updateProfile(userData);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
