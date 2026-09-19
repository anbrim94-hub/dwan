import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  loginData: {
    email: string;
    password: string;
  };
  setLoginData: (data: { email: string; password: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  return (
    <AuthContext.Provider value={{ loginData, setLoginData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}