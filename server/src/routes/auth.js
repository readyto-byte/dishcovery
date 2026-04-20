const express = require('express');
const router = express.Router();

const { signUp, logIn, logOut, resendEmailVerification } = require('../controllers/authController');

router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    if (!email){
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    if (!password){
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if(!firstName){
      return res.status(400).json({ success: false, error: 'First name is required' });
    }

    if (!lastName){
      return res.status(400).json({ success: false, error: 'Last name is required' });
    } 

    if (!username){
      return res.status(400).json({ success: false, error: 'Username is required' });
    } 

    const data = await signUp({ email, password, firstName, lastName, username });
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = email || username;

    if (!loginIdentifier) {
      return res.status(400).json({ success: false, error: 'Email or username is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const data = await logIn(loginIdentifier, password);
    const session = data.auth?.session;
    res.json({
      success: true,
      message: 'Logged in successfully',
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
      expires_at: session?.expires_at,
      account: data.account,
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await logOut();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
  }
    const data = await resendEmailVerification(email);
    res.json({ success: true, message: "Email verification resent successfully." });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;