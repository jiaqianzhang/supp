// const pool = require('./db');

// const deleteReviewModel = function(post_id) {
//     return new Promise((resolve, reject) => {
//         pool.query(
//             'DELETE FROM post WHERE post_id = $1',
//             [post_id],
//             (err, result) => {
//                 if (err) {
//                     console.error('Error executing DELETE query:', err);
//                     return reject(err);
//                 }

//                 console.log('Review deleted successfully');
//                 resolve(result);
//             }
//         );
//     });
// };

// module.exports = deleteReviewModel;