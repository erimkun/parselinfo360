import crypto from 'node:crypto';

const ENV_PREFIX = 'USER_';
const SESSION_COOKIE = 'parsel360_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'change-this-in-production';
}

function signPayload(payloadB64) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
}

function createSessionToken(user) {
  const payload = {
    user,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  const expected = signPayload(payloadB64);

  // Timing safe compare to reduce signature oracle risk.
  const sigBuf = Buffer.from(sig || '');
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  const payload = JSON.parse(base64UrlDecode(payloadB64));
  if (!payload?.user || Date.now() > Number(payload.exp || 0)) return null;
  return payload.user;
}

function parseUsersFromServerEnv() {
  const users = [];
  let idx = 0;

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(ENV_PREFIX) || typeof value !== 'string') continue;

    const parts = value.split('|');
    if (parts.length < 3) continue;
    const [firmaAdi, sifre, projeAdi] = parts;

    idx += 1;
    users.push({
      id: String(idx),
      firmaAdi: firmaAdi.trim(),
      sifre: sifre.trim(),
      adaParsel: key.slice(ENV_PREFIX.length),
      projeAdi: projeAdi.trim(),
      aktif: true,
    });
  }

  return users;
}

function serializeCookie(name, value, maxAgeSec = 0) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

function readCookie(req, name) {
  const cookieHeader = req.headers?.cookie || '';
  const parts = cookieHeader.split(';').map((p) => p.trim());
  const pair = parts.find((p) => p.startsWith(`${name}=`));
  if (!pair) return null;
  return pair.slice(name.length + 1);
}

export {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  parseUsersFromServerEnv,
  createSessionToken,
  verifySessionToken,
  serializeCookie,
  readCookie,
};
