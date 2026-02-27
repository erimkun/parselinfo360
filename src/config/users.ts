/**
 * Kullanıcı ve Proje Yapılandırması
 * 
 * Kullanıcılar .env dosyasından okunur.
 * Format: VITE_USER_{ada-parsel}=firmaAdi|sifre|projeAdi
 * Örnek: VITE_USER_1101-8=1101_8|parsel360|Bulgurlu Projesi
 */

export interface User {
  id: string;
  firmaAdi: string;
  sifre: string;
  adaParsel: string;
  projeAdi: string;
  aktif: boolean;
}

const ENV_PREFIX = 'VITE_USER_';

function parseUsersFromEnv(): User[] {
  const users: User[] = [];
  let idx = 0;

  for (const [key, value] of Object.entries(import.meta.env)) {
    if (!key.startsWith(ENV_PREFIX) || typeof value !== 'string') continue;

    const adaParsel = key.slice(ENV_PREFIX.length).replace('-', '_');
    const parts = value.split('|');
    if (parts.length < 3) continue;

    const [firmaAdi, sifre, projeAdi] = parts;
    idx++;
    users.push({
      id: String(idx),
      firmaAdi: firmaAdi.trim(),
      sifre: sifre.trim(),
      adaParsel,
      projeAdi: projeAdi.trim(),
      aktif: true,
    });
  }

  return users;
}

export const USERS: User[] = parseUsersFromEnv();

export const authenticateUser = (firmaAdi: string, sifre: string): User | null => {
  return USERS.find(
    u => u.firmaAdi.toLowerCase() === firmaAdi.toLowerCase() &&
         u.sifre === sifre &&
         u.aktif
  ) ?? null;
};

export const getUserByFirma = (firmaAdi: string): User | null => {
  return USERS.find(u => u.firmaAdi.toLowerCase() === firmaAdi.toLowerCase()) ?? null;
};
