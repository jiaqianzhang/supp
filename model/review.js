const pool = require('./db');

const reviewModel = function(post_account_id) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT post_title, post_description, post_file FROM post WHERE post_account_id = $1',
            [post_account_id],
            (err, result) => {
                if (err) {
                    console.error('Error executing SELECT query:', err);
                    return reject(err);
                }

                console.log('From model:', result.rows);
                resolve(result.rows);
            }
        );
    });
};

module.exports = reviewModel;