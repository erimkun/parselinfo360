const { SESSION_COOKIE, verifySessionToken, readCookie } = require('./_auth');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const token = readCookie(req, SESSION_COOKIE);
  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Oturum bulunamadı.' });
  }

  return res.status(200).json({ success: true, user });
};
