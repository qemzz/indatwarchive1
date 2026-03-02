import React, { createContext, useContext, useState } from "react";

export type UserRole = "dos" | "teacher" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  userEmail: string | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  userEmail: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Temporary mock auth until Supabase is connected
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = (email: string, userRole: UserRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUserEmail(email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
