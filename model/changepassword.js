const pool = require('./db');
const bcrypt = require('bcrypt');

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,}$/;
  return passwordRegex.test(password);
    
};

const changePasswordModel = function(email, oldPassword, newPassword, response) {
    pool.connect(function (err) {
        if (err) {
            console.error("Error connecting to the database:", err);
            return response(err, null);
        }

        const selectSql = 'SELECT account_id, account_password FROM account WHERE account_email = $1';
        pool.query(selectSql, [email], function (err, selectResults) {
            if (err) {
                console.error("Error executing SELECT query:", err);
                return response(err, null);
            }

            if (selectResults.rows.length === 0) {
                return response({ error: 'User not found' }, null);
            }

            const accountId = selectResults.rows[0].account_id;
            const currentPassword = selectResults.rows[0].account_password;

            // Compare the provided old password with the stored password
            bcrypt.compare(oldPassword, currentPassword, function (err, isMatch) {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return response(err, null);
                }

                if (!isMatch) {
                    return response({ error: 'Incorrect old password' }, null);
                }

                if (!newPassword) {
                    return response({ error: 'New password is null or undefined' }, null);
                }

                if (!validatePassword(newPassword)) {
                    return response({ error: 'New password does not meet the criteria' }, null);
                }

                const saltRounds = 10;
                bcrypt.hash(newPassword, saltRounds, function (err, hash) {
                    if (err) {
                        console.error('Error hashing new password:', err);
                        return response(err, null);
                    }

                    const updateSql = 'UPDATE account SET account_password = $1 WHERE account_id = $2';
                    pool.query(updateSql, [hash, accountId], function (err, updateResults) {
                        if (err) {
                            console.error("Error executing UPDATE query:", err);
                            return response(err, null);
                        } else {
                            if (updateResults.rowCount === 0) {
                                return response({ error: 'User not found' }, null);
                            } else {
                                return response(null, { success: true });
                            }
                        }
                    });
                });
            });
        });
    });
}

module.exports = changePasswordModel;