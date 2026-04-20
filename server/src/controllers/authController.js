const { supabase, supabaseAdmin } = require('../config/supabase');
const { rollbackAccountCreation } = require('./accountDelete');

// Sign Up
async function signUp({ email, password, firstName, lastName, username }) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim()

  const { data: authData, error: authError } = await supabase.auth.signUp({ email: normalizedEmail, password })

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
      username: normalizedUsername,
      email: normalizedEmail,
      is_verified: !!authData.user.email_confirmed_at,
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

  return { email: normalizedEmail, message: 'User registered successfully, Account Verification Email Sent.' }
}

// Dynamic Login Function for Email or Username Input
async function logIn(loginInfo, password) {
  if (!loginInfo) {
    throw new Error('Login information is required')
  }

  const normalizedLoginInfo = loginInfo.trim()
  let email = normalizedLoginInfo.toLowerCase()

  // Always try to resolve as username first so users can type either in one field.
  const normalizedUsername = normalizedLoginInfo.replace(/^@+/, '').trim()
  if (normalizedUsername) {
    const { data, error } = await supabaseAdmin
      .from('account')
      .select('id')
      .ilike('username', normalizedUsername)
      .limit(1)

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const account = data[0]
      // Resolve canonical email from Supabase Auth using account id.
      const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(account.id)
      if (authUserError || !authUserData?.user?.email) {
        throw new Error('Unable to resolve email for this username')
      }
      email = authUserData.user.email.trim().toLowerCase()
    }
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

  // Keep account.is_verified aligned with Supabase Auth (email confirmed).
  if (accountData && authData.user.email_confirmed_at && !accountData.is_verified) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('account')
      .update({ is_verified: true })
      .eq('id', authData.user.id)
      .select()
      .single()
    if (!updateError && updated) {
      accountData = updated
    }
  }

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