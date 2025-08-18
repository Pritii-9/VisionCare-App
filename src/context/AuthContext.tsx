import React, { createContext, useState, useContext, type ReactNode } from 'react';

// Define the shape of the context's value for TypeScript
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  login: (role: string) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create and export the Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);

  const login = (userRole: string) => {
    setIsAuthenticated(true);
    setRole(userRole);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:5000/api/logout', { credentials: 'include' });
    } catch (error) {
      console.error("Backend logout failed, logging out on client anyway.", error);
    } finally {
      setIsAuthenticated(false);
      setRole(null);
    }
  };

  const value = { isAuthenticated, role, login, logout: handleLogout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create and export the custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};