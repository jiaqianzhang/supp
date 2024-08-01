const pool = require('./db');

// Function to add a new post to the database
const addPostModel = async (postTitle, postDescription, postFile, postAccountEmail) => {
    try {
        const query = `insert into post (post_title, post_description, post_file, post_account_email) values ($1, $2, $3, $4) returning *;`;
        const values = [postTitle, postDescription, postFile, postAccountEmail];

        const result = await pool.query(query, values);
        return result.rows[0]; // Return the newly added post
    } catch (error) {
        console.error('Error adding post:', error);
        throw error;
    }
};

module.exports = addPostModel;