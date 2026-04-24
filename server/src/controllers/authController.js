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

const AUTH_USER_LIST_MAX_PAGES = 100

const DUPLICATE_ACTIVE_EMAIL_MESSAGE = 'This email is already registered and active.'
const ACCOUNT_NO_LONGER_EXISTS_MESSAGE = 'This account no longer exists.'

/**
 * Email is stored on Supabase Auth only. Resolve auth.users by email (admin list, paginated).
 */
async function findAuthUserByEmail(normalizedEmail) {
  const target = normalizedEmail.trim().toLowerCase()
  let page = 1
  const perPage = 1000

  for (let i = 0; i < AUTH_USER_LIST_MAX_PAGES; i += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users ?? []
    const found = users.find((u) => (u.email || '').trim().toLowerCase() === target)
    if (found) return found
    if (users.length < perPage) return null
    page += 1
  }

  return null
}

async function findDeletedEmailAccountStatus(normalizedEmail) {
  const { data: emailRow, error: emailRowError } = await supabaseAdmin
    .from('email')
    .select('username')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (emailRowError) throw emailRowError
  if (!emailRow?.username) return null

  const { data: accountRow, error: accountLookupError } = await supabaseAdmin
    .from('account')
    .select('status')
    .ilike('username', emailRow.username)
    .limit(1)
    .maybeSingle()

  if (accountLookupError) throw accountLookupError
  if (!accountRow) return null

  return normalizeAccountStatus(accountRow.status)
}

/**
 * - No auth user with this email → ok to sign up.
 * - Auth user + account INACTIVE → remove both so email can be reused.
 * - Auth user + account ACTIVE (or RESTRICTED) → block.
 * - Auth user but no account row → block (email already tied to auth).
 */
async function resolveExistingSignupEmail(normalizedEmail) {
  const existingAuthUser = await findAuthUserByEmail(normalizedEmail)
  if (!existingAuthUser) {
    const { data: emailRow, error: emailRowError } = await supabaseAdmin
      .from('email')
      .select('username')
      .ilike('email', normalizedEmail)
      .limit(1)
      .maybeSingle()

    if (emailRowError) throw emailRowError

    if (emailRow?.username) {
      const { data: accountRow, error: accountLookupError } = await supabaseAdmin
        .from('account')
        .select('status')
        .ilike('username', emailRow.username)
        .limit(1)
        .maybeSingle()

      if (accountLookupError) throw accountLookupError

      if (accountRow) {
        const normalizedStatus = normalizeAccountStatus(accountRow.status)
        if (normalizedStatus === 'INACTIVE') {
          throw new Error('This email was recently deleted. Please wait at least 90 days before reusing it or choose a different email.')
        }
      }

      throw new Error(DUPLICATE_ACTIVE_EMAIL_MESSAGE)
    }

    return
  }

  const { data: accountRow, error: accountLookupError } = await supabaseAdmin
    .from('account')
    .select('id, status')
    .eq('id', existingAuthUser.id)
    .maybeSingle()

  if (accountLookupError) throw accountLookupError

  if (!accountRow) {
    throw new Error(DUPLICATE_ACTIVE_EMAIL_MESSAGE)
  }

  const normalizedStatus = normalizeAccountStatus(accountRow.status)

  if (normalizedStatus === 'INACTIVE') {
    const { error: profileDelError } = await supabaseAdmin
      .from('profile')
      .delete()
      .eq('account_id', existingAuthUser.id)

    if (profileDelError) throw profileDelError

    const { error: accountDelError } = await supabaseAdmin
      .from('account')
      .delete()
      .eq('id', existingAuthUser.id)

    if (accountDelError) throw accountDelError

    const { error: authDelError } = await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id)
    if (authDelError) throw authDelError
    return
  }

  throw new Error(DUPLICATE_ACTIVE_EMAIL_MESSAGE)
}

// Sign Up
async function signUp({ email, password, firstName, lastName, username }) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim()
  const emailRedirectTo = getEmailRedirectToWithName(firstName)

  await resolveExistingSignupEmail(normalizedEmail)

  // If this username is already taken, block re-registration immediately.
  const { data: existingByUsername } = await supabaseAdmin
    .from('account')
    .select('id, status')
    .ilike('username', normalizedUsername)
    .limit(1)

  if (Array.isArray(existingByUsername) && existingByUsername.length > 0) {
    throw new Error('This username is already taken.')
  }

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

  // Duplicate confirmed email: Supabase returns success with no identities and may reuse the
  // existing user's id. Do not call rollbackAccountCreation here — it would delete the real
  // `account` row and fail on FKs (e.g. profile_account_id_fkey) or corrupt a live account.
  const identities = authData.user.identities
  if (!Array.isArray(identities) || identities.length === 0) {
    throw new Error(DUPLICATE_ACTIVE_EMAIL_MESSAGE)
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
    const isDuplicateKey = String(accountError?.code || '') === '23505'
      || String(accountError?.message || '').toLowerCase().includes('duplicate key')

    if (isDuplicateKey) {
      const { data: duplicateByUsername } = await supabaseAdmin
        .from('account')
        .select('id, status')
        .ilike('username', normalizedUsername)
        .limit(1)

      if (Array.isArray(duplicateByUsername) && duplicateByUsername.length > 0) {
        throw new Error('This username is already taken.')
      }
    }

    try {
      await rollbackAccountCreation(userId);

    } catch (e) {
      console.error('Rollback failed:', e.message)
    }

    throw accountError
  }

  const { error: emailInsertError } = await supabaseAdmin
    .from('email')
    .insert([{ email: normalizedEmail, username: normalizedUsername }])

  if (emailInsertError) {
    try {
      await rollbackAccountCreation(userId);
    } catch (e) {
      console.error('Rollback failed:', e.message)
    }
    throw emailInsertError
  }

  return { email: normalizedEmail, message: 'User registered successfully, Account Verification Email Sent.' }
}

// Dynamic Login Function for Email or Username Input
async function logIn(loginInfo, password) {
  if (!loginInfo) {
    throw new Error('Login information is required')
  }

  const normalizedLoginInfo = loginInfo.trim()
  const isEmailInput = normalizedLoginInfo.includes('@')
  let email = normalizedLoginInfo.toLowerCase()

  if (isEmailInput) {
    const deletedStatus = await findDeletedEmailAccountStatus(email)
    if (deletedStatus === 'INACTIVE') {
      throw new Error(ACCOUNT_NO_LONGER_EXISTS_MESSAGE)
    }
  } else {
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
          const { data: accountStatusData, error: accountStatusError } = await supabaseAdmin
            .from('account')
            .select('status')
            .eq('id', account.id)
            .maybeSingle()

          if (accountStatusError) {
            throw accountStatusError
          }

          if (accountStatusData && normalizeAccountStatus(accountStatusData.status) === 'INACTIVE') {
            throw new Error(ACCOUNT_NO_LONGER_EXISTS_MESSAGE)
          }

          throw new Error(ACCOUNT_NO_LONGER_EXISTS_MESSAGE)
        }
        email = authUserData.user.email.trim().toLowerCase()
      }
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
    throw new Error(ACCOUNT_NO_LONGER_EXISTS_MESSAGE)
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