import React, { useState } from 'react';
import type { User, LoginResponse } from '../config/users';
import { Eye, EyeOff } from 'lucide-react';
import KentasLogoWhite from '/KentasLogoWhite.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [firmaAdi, setFirmaAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firmaAdi.trim()) {
      setError('Lütfen firma adınızı girin.');
      return;
    }
    
    if (!sifre.trim()) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firmaAdi: firmaAdi.trim(),
          sifre
        })
      });

      const data = await res.json() as LoginResponse;
      if (res.ok && data.success && data.user) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Firma adı veya şifre hatalı.');
      }
    } catch {
      setError('Giriş servisine ulaşılamadı. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080b19] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-black/30 shadow-2xl backdrop-blur-xl">
          <div className="p-6 pb-0">
            <div className="flex h-32 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-emerald-400/20">
              <img src={KentasLogoWhite} alt="Kentas" className="h-20 w-auto" />
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-xl font-semibold text-white">Parsel360+ Portal Girişi</h1>
              <p className="text-sm text-white/65">Firma hesabınız ile güvenli giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="firmaAdi">
                  Firma Adı
                </label>
                <input
                  id="firmaAdi"
                  type="text"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/45 transition focus:border-cyan-300/60 focus:outline-none"
                  placeholder="Firma adınızı girin..."
                  value={firmaAdi}
                  onChange={e => setFirmaAdi(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="sifre">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="sifre"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-white placeholder-white/45 transition focus:border-cyan-300/60 focus:outline-none"
                    placeholder="Şifrenizi girin..."
                    value={sifre}
                    onChange={e => setSifre(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 transition hover:text-white/80"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="text-center text-xs text-white/55">
                Demo için: <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/80">1101_8</span> / <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/80">parsel360</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
