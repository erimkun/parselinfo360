import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  parseUsersFromServerEnv,
  createSessionToken,
  serializeCookie,
} from './_auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { firmaAdi, sifre } = req.body || {};
  if (!firmaAdi || !sifre) {
    return res.status(400).json({ success: false, message: 'Firma adı ve şifre zorunlu.' });
  }

  const users = parseUsersFromServerEnv();
  const user = users.find(
    (u) => u.firmaAdi.toLowerCase() === String(firmaAdi).toLowerCase() &&
      u.sifre === String(sifre) &&
      u.aktif
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Firma adı veya şifre hatalı.' });
  }

  const { sifre: _hidden, ...safeUser } = user;
  const token = createSessionToken(safeUser);
  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, token, Math.floor(SESSION_TTL_MS / 1000)));
  return res.status(200).json({ success: true, user: safeUser });
}
