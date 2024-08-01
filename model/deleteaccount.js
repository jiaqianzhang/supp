const pool = require('./db');

const deleteAccountModel = function(email, response) {
    pool.connect(async (err, client, release) => {
        if (err) {
            console.error("Error connecting to the database:", err);
            return response(err, null);
        }

        try {
            const selectSql = 'SELECT account_id FROM account WHERE account_email = $1';
            const selectResults = await client.query(selectSql, [email]);

            if (selectResults.rows.length === 0) {
                return response({ error: 'User not found' }, null);
            }

            const accountId = selectResults.rows[0].account_id;

            const deleteSql = 'DELETE FROM account WHERE account_id = $1';
            const deleteResults = await client.query(deleteSql, [accountId]);

            if (deleteResults.rowCount === 0) {
                return response({ error: 'User not found' }, null);
            } else {
                return response(null, { success: true });
            }
        } catch (err) {
            console.error("Error executing query:", err);
            return response(err, null);
        } finally {
            release();
        }
    });
};

module.exports = deleteAccountModel;