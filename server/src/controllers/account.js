const { supabase, supabaseAdmin } = require('../config/supabase');

async function getAccountById(accountId) {
  const { data: account, error: accountError } = await supabaseAdmin
    .from('account')
    .select('id, first_name, last_name, username')
    .eq('id', accountId)
    .single();

  if (accountError) {
    throw accountError;
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(accountId);
  if (authError || !authData?.user) {
    throw new Error('Unable to load account auth data');
  }

  return {
    ...account,
    email: authData.user.email ?? '',
  };
}

async function updateAccountById(accountId, updates = {}) {
  const accountUpdates = {};

  if (typeof updates.firstName === 'string') {
    accountUpdates.first_name = updates.firstName.trim();
  }

  if (typeof updates.lastName === 'string') {
    accountUpdates.last_name = updates.lastName.trim();
  }

  if (typeof updates.username === 'string') {
    accountUpdates.username = updates.username.trim();
  }

  if (Object.keys(accountUpdates).length > 0) {
    const { error: accountUpdateError } = await supabaseAdmin
      .from('account')
      .update(accountUpdates)
      .eq('id', accountId);

    if (accountUpdateError) {
      throw accountUpdateError;
    }
  }

  if (typeof updates.email === 'string' && updates.email.trim()) {
    const { error: emailUpdateError } = await supabaseAdmin.auth.admin.updateUserById(accountId, {
      email: updates.email.trim().toLowerCase(),
    });

    if (emailUpdateError) {
      throw emailUpdateError;
    }
  }

  if (typeof updates.newPassword === 'string' && updates.newPassword.length >= 6) {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(accountId);
    const userEmail = authData?.user?.email;
    if (!userEmail) throw new Error('Unable to verify identity.');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: updates.currentPassword ?? '',
    });

    if (signInError) {
      const err = new Error('Current password is incorrect.');
      err.statusCode = 400;
      throw err;
    }

    const { error: passwordUpdateError } = await supabaseAdmin.auth.admin.updateUserById(accountId, {
      password: updates.newPassword,
    });

    if (passwordUpdateError) {
      throw passwordUpdateError;
    }
  }

  return getAccountById(accountId);
}

module.exports = {
  getAccountById,
  updateAccountById,
};
