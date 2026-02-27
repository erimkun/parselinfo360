import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../config/users';

interface CompanyContextType {
  user: User | null;
  authReady: boolean;
  company: string | null;
  adaParsel: string | null;
  login: (user: User) => void;
  logout: () => void;
  setCompany: (name: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthReady(true);
      }
    };
    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
    }).catch(() => undefined);
  };

  const setCompany = (_name: string) => {
    console.warn('setCompany deprecated, use login() instead');
  };

  return (
    <CompanyContext.Provider value={{ 
      user,
      authReady,
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
