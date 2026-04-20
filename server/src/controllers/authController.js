const { supabase, supabaseAdmin } = require('../config/supabase');
const { rollbackAccountCreation } = require('./accountDelete');

// Sign Up
async function signUp({ email, password, firstName, lastName, username }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

  if (authError) throw authError

  if (!authData?.user?.id) {
    throw new Error('No user ID returned from auth signUp')
  }

  const userId = authData.user.id

  const { data: accountData, error: accountError } = await supabaseAdmin
    .from('account')
    .insert([{
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username,
    }])
    .single()

  if (accountError) {
    try {
      await rollbackAccountCreation(userId);

    } catch (e) {
      console.error('Rollback failed:', e.message)
    }

    throw accountError
  }

  return { email: email, message: 'User registered successfully, Account Verification Email Sent.' }
}

// Dynamic Login Function for Email or Username Input
async function logIn(loginInfo, password) {
  if (!loginInfo) {
    throw new Error('Login information is required')
  }

  const normalizedLoginInfo = loginInfo.trim()
  let email = normalizedLoginInfo

  // Check if input is a username (does not contain '@')
  if (!normalizedLoginInfo.includes('@')) {
    // Look up the auth user id from account using username
    const { data, error } = await supabaseAdmin
      .from('account')
      .select('id')
      .ilike('username', normalizedLoginInfo)
      .single()

    if (error || !data) {
      throw new Error('Username not found')
    }

    // Resolve the actual auth email from Supabase Auth using auth user id
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(data.id)
    if (userError || !userData?.user?.email) {
      throw new Error('Could not resolve email for this username')
    }

    email = userData.user.email
  }

  // Login with the resolved email/username and password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) throw authError

  // Checks if user's email is confirmed in the Auth Database
  if (!authData.user.email_confirmed_at) {
    await supabase.auth.signOut()
    throw new Error('Email not verified. Please check your inbox for the verification email.')  
  }

  let accountData = null
  if (authData?.user?.id) {
    const { data, error } = await supabase
      .from('account')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    if (!error) accountData = data
  }

  // Checks if the user's account is verified in the Account Database
  if (accountData && !accountData.is_verified) {
  await supabase.auth.signOut()
  throw new Error('Account not verified. Please check your email.')
}

  return { auth: authData, account: accountData }
}

// Resend Email Verification
async function resendEmailVerification(email) {
  const {error} = await supabase.auth.resend({ 
    type: 'signup',
    email: email
  })

  if (error) throw error
  return { message: 'Verification email resent successfully.' }
}

// Logout
async function logOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

module.exports = { signUp, logIn, logOut, resendEmailVerification };