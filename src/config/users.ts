/**
 * Kullanıcı ve Proje Yapılandırması
 * 
 * Bu dosya şimdilik statik kullanıcı verilerini tutar.
 * İleride backend API'den alınacak şekilde güncellenebilir.
 * 
 * Her kullanıcı bir firmayı temsil eder ve bir projeye (ada_parsel) bağlıdır.
 * Veri ilişkileri:
 * - Parsel → ada_parsel (primary key)
 * - POI (Olanaklar) → ada_parsel ile filtrelenir
 * - Service Area → ada_parsel ile filtrelenir
 * - Mahalle verileri → parsel'deki mahalle adı ile ilişkilendirilir
 */

export interface User {
  id: string;
  firmaAdi: string;
  sifre: string;
  adaParsel: string;
  projeAdi: string;
  aktif: boolean;
}

/**
 * Mock kullanıcı listesi
 * TODO: İleride bu veriler backend API'den gelecek
 */
export const USERS: User[] = [
  {
    id: '1',
    firmaAdi: '1101_8',
    sifre: 'parsel360',
    adaParsel: '1101_8',
    projeAdi: 'Bulgurlu Projesi',
    aktif: true
  },
  // Yeni projeler eklendiğinde buraya yeni kullanıcılar eklenecek
  // Örnek:
  // {
  //   id: '2',
  //   firmaAdi: 'ABC_Insaat',
  //   sifre: 'abc123',
  //   adaParsel: '2205_12',
  //   projeAdi: 'Kadıköy Projesi',
  //   aktif: true
  // },
];

/**
 * Kullanıcı doğrulama fonksiyonu
 * @param firmaAdi Firma adı
 * @param sifre Şifre
 * @returns Doğrulanmış kullanıcı veya null
 */
export const authenticateUser = (firmaAdi: string, sifre: string): User | null => {
  const user = USERS.find(
    u => u.firmaAdi.toLowerCase() === firmaAdi.toLowerCase() && 
         u.sifre === sifre && 
         u.aktif
  );
  return user || null;
};

/**
 * Firma adına göre kullanıcı bul
 * @param firmaAdi Firma adı
 * @returns Kullanıcı veya null
 */
export const getUserByFirma = (firmaAdi: string): User | null => {
  return USERS.find(u => u.firmaAdi.toLowerCase() === firmaAdi.toLowerCase()) || null;
};
