const pool = require('./db');

const deleteAccountModel = async function(email, response) {
    const client = await pool.connect();

    try {
        // Trim and sanitize email
        if (typeof email === 'string') {
            email = email.trim().toLowerCase();
        } else {
            return response({ error: 'Invalid email format' }, null);
        }

        // Get the account ID
        const selectSql = 'SELECT account_id FROM account WHERE account_email = $1';
        const selectResults = await client.query(selectSql, [email]);

        if (selectResults.rows.length === 0) {
            return response({ error: 'User not found' }, null);
        }

        const accountId = selectResults.rows[0].account_id;

        // Delete associated posts
        await client.query('DELETE FROM post WHERE post_account_id = $1', [accountId]);

        // Delete the account
        const deleteSql = 'DELETE FROM account WHERE account_id = $1';
        const deleteResults = await client.query(deleteSql, [accountId]);

        if (deleteResults.rowCount === 0) {
            return response({ error: 'Failed to delete account' }, null);
        } else {
            return response(null, { success: true });
        }
    } catch (err) {
        console.error("Error deleting account:", err);
        return response({ error: 'Internal Server Error' }, null);
    } finally {
        client.release();
    }
};
module.exports = deleteAccountModel;