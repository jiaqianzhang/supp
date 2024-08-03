const pool = require('./db');
const bcrypt = require('bcrypt');

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,}$/;
  return passwordRegex.test(password);
};

const changePasswordModel = async function(email, oldPassword, newPassword, response) {
    const client = await pool.connect();

    try {
        // // Ensure email is correctly handled
        // if (typeof email === 'string') {
        //     email = email.trim().toLowerCase();
        // } else {
        //     console.error('Email is not a string:', email);
        //     return response({ error: 'Invalid email format' }, null);
        // }

        // console.log('Checking email in the database:', email);

        // Fetch user details by email
        const selectSql = 'SELECT account_id, account_password FROM account WHERE account_email = $1';
        const selectResults = await client.query(selectSql, [email]);

        console.log('Select query results:', selectResults.rows);

        if (selectResults.rows.length === 0) {
            return response({ error: 'User not found' }, null);
        }

        const accountId = selectResults.rows[0].account_id;
        const currentPassword = selectResults.rows[0].account_password;

        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, currentPassword);
        if (!isMatch) {
            return response({ error: 'Incorrect old password' }, null);
        }

        // Validate new password
        if (!validatePassword(newPassword)) {
            return response({ error: 'New password does not meet the criteria' }, null);
        }

        // Hash new password
        const saltRounds = 10;
        const hash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        const updateSql = 'UPDATE account SET account_password = $1 WHERE account_id = $2';
        const updateResults = await client.query(updateSql, [hash, accountId]);

        if (updateResults.rowCount === 0) {
            return response({ error: 'Failed to update password' }, null);
        } else {
            return response(null, { success: true });
        }
    } catch (err) {
        console.error("Error changing password:", err);
        return response({ error: 'Internal Server Error' }, null);
    } finally {
        client.release();
    }
};

module.exports = changePasswordModel;