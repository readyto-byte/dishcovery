const { supabaseAdmin } = require('../config/supabase')

function normalizeAccountStatus(status) {
  if (typeof status !== 'string') {
    return ''
  }

  return status.trim().replace(/^"+|"+$/g, '').toUpperCase()
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

async function deleteAccount(userId) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from('account')
    .select('id, is_verified, status')
    .eq('id', userId)
    .single()

  if (accountError) {
    throw accountError
  }

  const normalizedStatus = normalizeAccountStatus(account?.status)
  const isRestricted = normalizedStatus === 'RESTRICTED'
  const isActive = normalizedStatus === 'ACTIVE'

  if (!account?.is_verified || !isActive || isRestricted) {
    throw new Error('Account is not eligible for deletion.')
  }

  const { error: statusError } = await supabaseAdmin
    .from('account')
    .update({ status: 'INACTIVE' })
    .eq('id', userId)

  if (statusError) {
    throw statusError
  }

  // Deletes the user from the Auth Database
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authDeleteError) {
    throw authDeleteError
  }

  // Deletes the user from the Account Database
  const { error: deleteError } = await supabaseAdmin
    .from('account')
    .delete()
    .eq('id', userId)

  if (deleteError) {
    throw deleteError
  }
}

module.exports = { rollbackAccountCreation, deleteAccount };
