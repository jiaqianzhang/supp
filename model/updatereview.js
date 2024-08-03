

const updateReviewModel = function(post_id, title, description, file_url) {
    return new Promise((resolve, reject) => {
        pool.query(
            'UPDATE post SET post_title = $1, post_description = $2, post_file = $3 WHERE post_id = $4',
            [title, description, file_url, post_id],
            (err, result) => {
                if (err) {
                    console.error('Error executing UPDATE query:', err);
                    return reject(err);
                }

                console.log('Review updated successfully');
                resolve(result);
            }
        );
    });
};

module.exports = updateReviewModel;