const express = require("express");
const path = require('path');
const jwt = require('jsonwebtoken');
const model = require('../model/index'); // Assuming your model file is in the correct path
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Define the path to the static assets (CSS, JavaScript, images, etc.)
const staticPath = path.join(__dirname, '../view/');
const sessionSecret = process.env.SESSION_SECRET || 'This_1_Is_2_A_3_Secret_4!';
const secretKey = process.env.JWT_SECRET || 'extra secret key';

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(staticPath));

// Initialize session
app.use(session({
  secret: sessionSecret, // set secret key
  resave: false, // set false to not store data
  saveUninitialized: false, // set false for doesn't store data
  cookie: { // set cookie
    maxAge: 60 * 60 * 6000, // expire in 6 hours
    secure: false, 
    httpOnly: true, // http only for security
    sameSite: 'strict', // strict for security
    path: '/'
  },
}));

// SIGN IN POST REQUEST
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  console.log(`Received signin request for email: ${email}`);

  // Call to login model with email and password
  model.signinModel(email, password, (result) => {
    if (result.success) {
      const { account_id } = result.user; // Ensure `user` contains `account_id`
      const token = jwt.sign({ email: email, account_id: account_id }, secretKey, { expiresIn: '1h' });
      req.session.token = token;
      res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, path: '/' });
      res.json({ success: true, email: email, token });
      console.log('Token set in session:', req.session.token);
      console.log('Token set in cookie:', token);
    } else {
      res.status(401).json({ success: false, message: result.message });
    }
  });
});

// REGISTER POST REQUEST
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  model.registerModel(email, password, (result) => {
    if (result.success) {
      const { account_id } = result; // Ensure `result` contains `account_id`
      const token = jwt.sign({ email: email, account_id: account_id }, secretKey, { expiresIn: '6h' });
      req.session.token = token;
      res.cookie('token', token, { maxAge: 60 * 60 * 6000, httpOnly: true, path: '/' });
      res.json({ success: true, email: email, account_id: account_id, token });
      console.log('Token set in session:', req.session.token);
      console.log('Token set in cookie:', token);
    } else {
      console.error('Registration failed for some reason.');
      res.status(400).json({ success: false, message: result.message });
    }
  });
});

// DASHBOARD POST REQUEST
app.post('/dashboard', (req, res) => {
  // Log session token for debugging
  console.log('Session token:', req.session.token);

  // Check if there is a token in the session or if it's a registration request
  if (req.session.token || req.body.registration) 
  {
    try 
    {
      // Verify the token
      const decodedToken = jwt.verify(req.session.token, secretKey);
      const userEmail = decodedToken.email;  // Extract the email from the token
            
      console.log('Decoded token email:', userEmail);

      // Query the database for the user's email
      model.selectModel(userEmail, function(err, result) {
        if (err) 
        {
          console.error('Error in selectModel:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('Result from selectModel:', result);

        if (result && result.account_email)
        {
          const { account_email } = result;

          // Set the response headers and send the user data
          res.setHeader('Content-Type', 'application/json');
          return res.json({ status: 'success', user: { email: account_email } });
        } 
        else 
        {
          // User data not found
          console.log('User data not found');
          return res.status(404).json({ error: 'User data not found' });
        }
      });
    } 
    catch (error) 
    {
      // Handle token verification errors
      console.error('Token verification failed:', error);
      return res.status(401).json({ status: 'redirect', redirectUrl: '/signin', error: 'Unauthorized access' });
    }
  }
  else 
  {
    // No token found in session or registration request
    console.log('No token found in session or registration request');
    return res.status(401).json({ status: 'redirect', redirectUrl: '/signin', error: 'Unauthorized access' });
  }
});

// LOG OUT POST REQUEST
app.post("/logout", (req, res) => {
  console.log("Logout requested");
  req.session.destroy((err) => {
    if (err) {
      // clear token time living
      console.log("Error trying to destroy the session:", err);
      res.status(500).json("Internal Server Error");
      return;
    }
    res.clearCookie('token');
    res.json("You have been logged out.");
  });
});

// UPDATE PASSWORD POST REQUEST
app.post("/changepassword", (req, res) => {
  console.log('Request Body:', req.body);
  const email = req.session.user;
  console.log('New Password Value:', req.body.newPassword);

  model.changePasswordModel(email, req.body.oldPassword, req.body.newPassword, (err, result) => {
    if (err) {
      console.error('Error changing password:', err);
      res.status(500).send('Internal Server Error');
    } else if (result && result.success) {
      console.log('Password changed successfully.');
      res.send(result);
    } else {
      console.error('Error changing password. User not found.');
      res.status(404).send('User not found');
    }
  });
});

// DELETE ACCOUNT POST REQUEST
app.post("/deleteaccount", (req, res) => {
  const email = req.session.user;

  // clear token and account time life
  model.deleteAccountModel(email, (err, result) => {
    if (err) {
      console.error('Error deleting account:', err);
      res.status(500).send('Internal Server Error');
    } else if (result && result.success) {
      console.log('Delete account successfully.');
      res.send(result);
    } else {
      console.error('Error deleting account. User not found.');
      res.status(404).send('User not found');
    }
  });
});

app.use(cookieParser());
// ADD POST REQUEST
app.post('/addpost', async (req, res) => {
  const token = req.session.token;

  // Check for the presence of the token
  if (!token || token === 'null') {
    console.error('Token is missing or null in the authorization header');
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  console.log('Token received:', token);

  // Log the entire request headers for debugging
  console.log('Request Headers:', req.headers);

  // Decode the token without verification to inspect its structure
  const decodedWithoutVerify = jwt.decode(token, { complete: true });
  console.log('Decoded Token Without Verification:', decodedWithoutVerify);

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, secretKey);
    console.log('Decoded Token:', decodedToken);

    // Check if account_id is present in the token payload
    if (!decodedToken.account_id) {
      console.error('account_id is missing in the token payload');
      return res.status(400).json({ error: 'account_id is missing in the token payload' });
    }

    const postAccountId = decodedToken.account_id;
    const { post_title, post_description, post_file } = req.body;

    // Validate input fields
    if (!post_title || !post_description || !post_file) {
      console.error('Validation error: Title, description, and file URL are required');
      return res.status(400).json({ error: 'Title, description, and file URL are required' });
    }

    // Call the model function to add the post
    const newPost = await model.addPostModel(post_title, post_description, post_file, postAccountId);
    res.status(201).json(newPost);

  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Handle other errors
    console.error('Error adding post:', error);
    return res.status(500).json({ error: 'Failed to add post' });
  }
});

app.get('/review', async (req, res) => {
  const token = req.session.token;

  // Check for the presence of the token
  if (!token || token === 'null') {
      console.error('Token is missing or null in the authorization header');
      return res.status(401).json({ error: 'Unauthorized access' });
  }

  try {
      // Verify the token
      const decodedToken = jwt.verify(token, secretKey);
      console.log('Decoded Token:', decodedToken);

      if (!decodedToken.account_id) {
          console.error('account_id is missing in the token payload');
          return res.status(400).json({ error: 'account_id is missing in the token payload' });
      }

      const post_account_id = decodedToken.account_id;
      const userReviews = await model.reviewModel(post_account_id);

      // Ensure the response is an array
      if (!Array.isArray(userReviews)) {
          throw new TypeError('Expected userReviews to be an array');
      }

      res.json(userReviews);
  } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// New route for deleting a review
app.delete('/review/:post_id', async (req, res) => {
  const { post_id } = req.params;

  try {
    await model.deleteReviewModel(post_id);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// New route for updating a review
app.put('/review/:post_id', async (req, res) => {
  const { post_id } = req.params;
  const { title, description, file_url } = req.body;

  try {
    await model.updateReviewModel(post_id, title, description, file_url);
    res.status(200).json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});


app.get('/firebase-config', (req, res) => {
  res.json({
      apiKey: "AIzaSyC2aagWV9vxVf6kqiqvTaoyJOWO_h-bpgc",
      authDomain: "supp-c1e01.firebaseapp.com",
      projectId: "supp-c1e01",
      storageBucket: "supp-c1e01.appspot.com",
      messagingSenderId: "978693849785",
      appId: "1:978693849785:web:dfd8ed67016f11b5475168",
      measurementId: "G-REKKVDD6XK"
  });
});


// Route to serve index.html for all GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Assign the port to the server
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});