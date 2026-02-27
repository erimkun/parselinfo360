import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../config/users';

interface CompanyContextType {
  /** Giriş yapan kullanıcı bilgileri */
  user: User | null;
  /** Firma adı (user.firmaAdi'nin kısayolu) */
  company: string | null;
  /** Ada/Parsel bilgisi - veri filtreleme için ana key */
  adaParsel: string | null;
  /** Giriş fonksiyonu */
  login: (user: User) => void;
  /** Çıkış fonksiyonu */
  logout: () => void;
  /** Legacy setter (geriye uyumluluk için) */
  setCompany: (name: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // Legacy setter - geriye uyumluluk için (artık login kullanılmalı)
  const setCompany = (name: string) => {
    // Bu fonksiyon artık doğrudan kullanılmamalı
    // Eski kodlarla uyumluluk için bırakıldı
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
