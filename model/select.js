// sql select query for selecting the data that the dashboard needs to display for personalisation
const pool = require('./db');

const selectModel = function(email, callback) {
    pool.query('SELECT account_email FROM account WHERE account_email = $1', [email], (err, result) => {
        if (err) {
            console.error('Error executing SELECT query:', err);
            return callback(err, null);
        }

        console.log('From model:', result);
        callback(null, result.rows.length > 0 ? result.rows[0] : null);
    });
};

module.exports = selectModel;