const pool = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// validation function
function validateUserData(email, password) 
{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

    if (!emailRegex.test(email)) 
    {
        return { valid: false, message: "Invalid email address" };
    }
    if (!passwordRegex.test(password)) 
    {
        return { valid: false, message: "Invalid password format" };
    }
    return { valid: true };
}

// sign up function, validates user information against database and creates a new user
async function registerModel(email, password, callback) 
{
    try 
    {
        // validate user data before database queries
        const validation = validateUserData(email, password);

        if (!validation.valid)
        {
            return callback({ success: false, message: validation.message});
        }

        // check if the username or email already exists
        const existingEmailQuery = 'select 1 from account where account_email = $1';
        const existingEmailResult = await pool.query(existingEmailQuery, [email]);

        if (existingEmailResult.rows.length > 0)
        {
            return callback({ success: false, message: "Email already exists" });
        }
        
        // hash the password and insert the new user
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const insertUserQuery = 'insert into account(account_email, account_password) values($1, $2) returning *';
        const newUser = await pool.query(insertUserQuery, [email, hashedPassword]);

        // if user was succesfully added, report back result, otherwise, registration failed
        if (newUser.rows.length > 0) 
        {
            return callback({ success: true, email: email, message: "Register successful" });
        } 
        else
        {
            return callback({ success: false, message: "Registration failed" });
        }
    } 
    catch (error) 
    { // catch all error
        console.error('Error during registration:', error);
        return callback({ success: false, message: "Internal Server Error" });
    } 
}

module.exports = registerModel;