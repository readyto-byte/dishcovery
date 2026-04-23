const { supabaseAdmin } = require('../config/supabase');

async function deleteAccount(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const { error: authError } = await supabaseAdmin
                                    .auth
                                    .admin
                                    .deleteUser(userId);
  if (authError) {
    throw authError;
  }

  const { error: accountError } = await supabaseAdmin
    .from('account')
    .delete()
    .eq('id', userId);

  if (accountError) {
    throw accountError;
  }
}

async function rollbackAccountCreation(userId) {
  await deleteAccount(userId);
}

module.exports = { rollbackAccountCreation, deleteAccount };
