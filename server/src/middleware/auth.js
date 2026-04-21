const { supabase } = require('../config/supabase');

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token verification failed' });
  }
}

module.exports = authMiddleware;
