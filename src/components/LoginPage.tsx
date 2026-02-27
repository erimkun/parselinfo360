import React, { useState } from 'react';
import { authenticateUser, type User } from '../config/users';
import { Building2, Lock, Eye, EyeOff } from 'lucide-react';

// Tema renkleri ve modern bir görünüm için Tailwind CSS kullanılıyor.

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

    // Simüle edilmiş gecikme (ileride gerçek API çağrısı olacak)
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authenticateUser(firmaAdi.trim(), sifre);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Firma adı veya şifre hatalı.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="bg-white/90 dark:bg-gray-900/90 shadow-2xl rounded-2xl p-8 w-full max-w-md border border-blue-200 dark:border-gray-700 backdrop-blur-xl">
        
        {/* Logo ve Başlık */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">Parsel360+</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gayrimenkul Yatırım Analiz Platformu</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Firma Adı */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm" htmlFor="firmaAdi">
              Firma Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 size={18} className="text-gray-400" />
              </div>
              <input
                id="firmaAdi"
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                placeholder="Firma adınızı girin..."
                value={firmaAdi}
                onChange={e => setFirmaAdi(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm" htmlFor="sifre">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="sifre"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                placeholder="Şifrenizi girin..."
                value={sifre}
                onChange={e => setSifre(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Demo Bilgisi */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Demo için: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">1101_8</span> / <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">parsel360</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
