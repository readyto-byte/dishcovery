const { createClient } = require('@supabase/supabase-js')
const { supabaseAdmin } = require('../config/supabase')

function normalizeAccountStatus(status) {
  if (typeof status !== 'string') {
    return ''
  }

  return status.trim().replace(/^"+|"+$/g, '').toUpperCase()
}

/**
 * Confirms the FRONT END knows the account password without mutating the shared server auth client.
 */
async function verifyAccountPassword(userId, password) {
  const trimmed = typeof password === 'string' ? password.trim() : ''
  if (!trimmed) {
    throw new Error('Password is required to delete your account.')
  }

  const { data: authData, error: authLookupError } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (authLookupError || !authData?.user?.email) {
    throw new Error('Unable to verify password.')
  }

  const email = authData.user.email.trim().toLowerCase()
  const verifyClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )

  const { error: signError } = await verifyClient.auth.signInWithPassword({
    email,
    password: trimmed,
  })

  if (signError) {
    throw new Error('Incorrect password.')
  }
}

async function rollbackAccountCreation(userId) {
    // Deletes the user from the Auth Database
      await supabaseAdmin
        .auth
        .admin
        .deleteUser(userId)
      
      // Deletes the user from the Account Database
      await supabaseAdmin
        .from('account')
        .delete()
        .eq('id', userId)
}

async function deleteAccount(userId, password) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  await verifyAccountPassword(userId, password)

  const { data: account, error: accountError } = await supabaseAdmin
    .from('account')
    .select('id, username, is_verified, status')
    .eq('id', userId)
    .single()

  if (accountError) {
    throw accountError
  }

  const { data: authData, error: authLookupError } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (authLookupError || !authData?.user?.email) {
    throw new Error('Unable to resolve auth user email for account deletion.')
  }

  const normalizedStatus = normalizeAccountStatus(account?.status)
  const isRestricted = normalizedStatus === 'RESTRICTED'
  const isActive = normalizedStatus === 'ACTIVE'

  if (!account?.is_verified || !isActive || isRestricted) {
    throw new Error('Account is not eligible for deletion.')
  }

  const { error: statusError } = await supabaseAdmin
    .from('account')
    .update({ status: 'INACTIVE', is_verified: false })
    .eq('id', userId)

  if (statusError) {
    throw statusError
  }

  if (account?.username && authData?.user?.email) {
    const email = authData.user.email.trim().toLowerCase()
    const { error: emailInsertError } = await supabaseAdmin
      .from('email')
      .insert([{ email, username: account.username }])

    if (emailInsertError) {
      throw emailInsertError
    }
  }

  const { error: authDelError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authDelError) {
    throw authDelError
  }
}

module.exports = { rollbackAccountCreation, deleteAccount };
