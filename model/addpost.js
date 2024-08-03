const pool = require('./db');

// Function to add a new post to the database
const addPostModel = async (postTitle, postDescription, postFile, postAccountId) => {
  try {
    const query = `INSERT INTO post (post_title, post_description, post_file, post_account_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [postTitle, postDescription, postFile, postAccountId];

    const result = await pool.query(query, values);
    return result.rows[0]; // Return the newly added post
  } catch (error) {
    console.error('Error adding post:', error);
    throw error;
  }
};

module.exports = addPostModel;