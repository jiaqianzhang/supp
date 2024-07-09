// server file to handle get and requests from the client
// // const bcrypt = require('bcrypt');
// // const cors = require('cors');

const express = require("express");
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
var model = require('../model/index');
const session = require('express-session');

// Define the path to the static assets (CSS, JavaScript, images, etc.)
const staticPath = path.join(__dirname, '../view/'); // Adjust the path as per your project structure
const sessionSecret = process.env.SESSION_SECRET || 'This_1_Is_2_A_3_Secret_4!';
const secretKey = process.env.JWT_SECRET || 'extra secret key';

// app.use(express.static(staticPath));
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(staticPath));

app.use( // initialise session
  session({
    
    secret: sessionSecret, // set secret key
    resave: false, // set false to not store data
    saveUninitialized: false, // set false for doesnt store data
    cookie: { // set cookie
      maxAge: 60 * 60 * 6000, // expire in 6 hours
      secure: false, 
      httpOnly: true, // http only for security
      sameSite: 'strict', // strict for security
      path: '/'
    },
  })
);

// signin post request
app.post('/signin', (req, res) => {
  const { email, password} = req.body;
  console.log(`Received signin request for email: ${email}`); // Log the received email


  // Call to login model with email and password
  model.signinModel(email, password, (result) => {
    // If the user logged in successfully
    if (result.success) {

      const token = jwt.sign({ email: email }, secretKey); // generate a token
      req.session.user = email;
      // set token in both session and cookie
      req.session.token = token;
      res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, path: '/' }); // set to an hour, httponly for security and path / to be access by any route
      res.json({ success: true, email: email, token}); // send back response in json
      console.log('Token set in session:', req.session.token);
      console.log('Token set in cookie:', token);

           
    } else { // Failed to log in
      res.status(401).json({ success: false, message: result.message });
    }
  });
});

// register post request
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Call signup model with request information
  model.registerModel(email, password, (result) => {
    // If successful, create a token for the user
    if (result.success) 
    { 
      const token = jwt.sign({ email: email }, secretKey);// generate token using secret key
      req.session.token = token; // set token in session
      res.cookie('token', token, { maxAge: 60 * 60 * 6000, httpOnly: true, path: '/' }); // set token in cookies, 1 hours, http true for security, paht  can be access by any path
      res.json({ success: true, email: email , token }); // send back json response
      console.log('Token set in session:', req.session.token); // log token in session
      console.log('Token set in cookie:', token); // log token in cookie
    } 
    else 
    { // Otherwise, return the relevant error message
      console.error('Registration failed for some reason.');
      res.status(400).json({ success: false, message: result.message });
    }
  });
});

// Example GET endpoint for fetching user-specific data
app.get('/api/data', (req, res) => {
  // Verify token from the request header
  const token = req.headers.authorization.split(' ')[1]; // Extract token from header

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userEmail = decoded.email; // Extract user email from decoded token

    // Example: Fetch user-specific data from your database or model
    model.getUserData(userEmail, (userData) => {
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User data not found' });
      }

      // Example: Return user-specific data
      res.json({ success: true, data: userData });
    });
  });
});


// Route to serve index.html for all GET requests
app.get('*', function (req, res) {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Assign the port to the server
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});
