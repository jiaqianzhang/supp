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
async function registerModel(email, password, callback) {
    try {
        // Validate user data before database queries
        const validation = validateUserData(email, password);

        if (!validation.valid) {
            return callback({ success: false, message: validation.message });
        }

        // Check if the email already exists
        const existingEmailQuery = 'SELECT 1 FROM account WHERE account_email = $1';
        const existingEmailResult = await pool.query(existingEmailQuery, [email]);

        if (existingEmailResult.rows.length > 0) {
            return callback({ success: false, message: "Email already exists" });
        }

        // Hash the password and insert the new user
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const insertUserQuery = 'INSERT INTO account(account_email, account_password) VALUES($1, $2) RETURNING account_id, account_email';
        const newUser = await pool.query(insertUserQuery, [email, hashedPassword]);

        if (newUser.rows.length > 0) {
            const { account_id } = newUser.rows[0];
            return callback({ success: true, email: email, account_id: account_id, message: "Register successful" });
        } else {
            return callback({ success: false, message: "Registration failed" });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return callback({ success: false, message: "Internal Server Error" });
    }
}

module.exports = registerModel;