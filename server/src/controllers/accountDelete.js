const {supabase, supabaseAdmin} = require('../config/supabase')

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

}

module.exports = { rollbackAccountCreation, deleteAccount }