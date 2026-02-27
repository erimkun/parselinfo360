import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../config/users';
import { USERS } from '../config/users';

const SESSION_KEY = 'parsel360-session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

interface StoredSession {
  adaParsel: string;
  expiresAt: number;
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: StoredSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return USERS.find(u => u.adaParsel === session.adaParsel && u.aktif) ?? null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(user: User) {
  const session: StoredSession = {
    adaParsel: user.adaParsel,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

interface CompanyContextType {
  user: User | null;
  company: string | null;
  adaParsel: string | null;
  login: (user: User) => void;
  logout: () => void;
  setCompany: (name: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => loadSession());

  const login = (userData: User) => {
    setUser(userData);
    saveSession(userData);
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  const setCompany = (_name: string) => {
    console.warn('setCompany deprecated, use login() instead');
  };

  return (
    <CompanyContext.Provider value={{ 
      user,
      company: user?.firmaAdi || null,
      adaParsel: user?.adaParsel || null,
      login,
      logout,
      setCompany
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
};
