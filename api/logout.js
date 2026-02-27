const { SESSION_COOKIE, serializeCookie } = require('./_auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, '', 0));
  return res.status(200).json({ success: true });
};
