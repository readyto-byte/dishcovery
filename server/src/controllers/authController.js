const { supabase, supabaseAdmin } = require('../config/supabase');
const { rollbackAccountCreation } = require('./accountDelete');

function getEmailRedirectTo() {
  const baseUrl = (
    process.env.EMAIL_REDIRECT_TO
    || process.env.CLIENT_URL
    || process.env.FRONTEND_URL
    || 'http://localhost:5173'
  );

  return `${baseUrl.replace(/\/+$/, '')}/email-confirmed`;
}

function getEmailRedirectToWithName(firstName) {
  const redirectUrl = new URL(getEmailRedirectTo());
  if (firstName && String(firstName).trim()) {
    redirectUrl.searchParams.set('name', String(firstName).trim());
  }
  return redirectUrl.toString();
}

function normalizeAccountStatus(status) {
  if (typeof status !== 'string') {
    return ''
  }

  return status.trim().replace(/^"+|"+$/g, '').toUpperCase()
}

// Sign Up
async function signUp({ email, password, firstName, lastName, username }) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim()
  const emailRedirectTo = getEmailRedirectToWithName(firstName)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo,
    },
  })

  if (authError) throw authError

  if (!authData?.user?.id) {
    throw new Error('No user ID returned from auth signUp')
  }

  const userId = authData.user.id

  // `account` row mirrors profile fields; email lives on Supabase Auth only (no `email` column on `account`).
  const { data: accountData, error: accountError } = await supabaseAdmin
    .from('account')
    .insert([{
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username: normalizedUsername,
      is_verified: false,
      status: 'ACTIVE',
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
  const isAuthVerified = Boolean(authData?.user?.email_confirmed_at)
  if (!isAuthVerified) {
    await supabase.auth.signOut()
    throw new Error('Email not verified. Please check your inbox for the verification email.')  
  }

  if (!authData?.user?.id) {
    await supabase.auth.signOut()
    throw new Error('Unable to verify account.')
  }

  let accountData = null
  if (authData?.user?.id) {
    const { data, error } = await supabaseAdmin
      .from('account')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    if (error) {
      throw error
    }
    accountData = data
  }

  // Keep account.is_verified aligned with Supabase Auth (email confirmed).
  if (accountData && authData.user.email_confirmed_at && !accountData.is_verified && normalizeAccountStatus(accountData?.status) !== 'INACTIVE') {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('account')
      .update({ is_verified: true })
      .eq('id', authData.user.id)
      .select()
      .single()
    if (updateError) {
      await supabase.auth.signOut()
      throw updateError
    }
    accountData = updated
  }

  const normalizedStatus = normalizeAccountStatus(accountData?.status)
  const isRestricted = normalizedStatus === 'RESTRICTED'
  const isActive = normalizedStatus === 'ACTIVE'

  if (normalizedStatus === 'INACTIVE') {
    await supabase.auth.signOut()
    throw new Error('Account is deleted.')
  }

  if (!accountData?.is_verified) {
    await supabase.auth.signOut()
    throw new Error('Account not verified. Please check your email.')
  }

  if (!isActive || isRestricted) {
    await supabase.auth.signOut()
    throw new Error('Account is not active.')
  }

  return { auth: authData, account: accountData }
}

// Resend Email Verification
async function resendEmailVerification(email) {
  const emailRedirectTo = getEmailRedirectTo()
  const {error} = await supabase.auth.resend({ 
    type: 'signup',
    email,
    options: {
      emailRedirectTo,
    },
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