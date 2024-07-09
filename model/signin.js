// sql for selecting user from database based on email, used for when logging in, checks email and password from the database
const pool = require('./db'); // Import the opened pool
const bcrypt = require('bcrypt');

const signinModel = function(email, password, callback) 
{
    // checking if the email exist
    pool.query('select * from account where account_email = $1', [email], (err, result) => 
    {
        if (err) 
        {
            console.error('Error executing query', err.stack);
            callback({ success: false, message: 'Internal Server Error' });
            return;
        }
        if (result.rows.length === 0) 
        {
            callback({ success: false, message: 'User not found' });
            return;
        }
        
        // store the found user
        const user = result.rows[0];
        const hashedPassword = user.account_password; // retrieve the hashed password from the database
        
        // compare the password entered with the password of the found user
        bcrypt.compare(password, hashedPassword, (err, isMatch) => 
        {
            if (err)
            {
                console.error('Error comparing password:', err);
                callback({ success: false, message: 'Sign in error' });
                return;
            }
            if (isMatch) 
            {
                callback({ success: true, message: 'Sign in successful', user });
            } 
            else 
            {
                callback({ success: false, message: 'Invalid password' });
            }
        });
    });
};

module.exports = signinModel;
