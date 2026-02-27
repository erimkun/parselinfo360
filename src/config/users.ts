/**
 * İstemci tarafında yalnızca kullanıcı tipi tutulur.
 * Kullanıcı doğrulama server-side (api/login) yapılır.
 */

export interface User {
  id: string;
  firmaAdi: string;
  sifre: string;
  adaParsel: string;
  projeAdi: string;
  aktif: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}
