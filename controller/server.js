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
    },
  })
);

// signin post request
app.post('/signin', (req, res) => {
  const { email, password} = req.body;

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


// // Settings post request for change username
// app.post('/changeusername', (req, res) => {
//   const { curUser, username, password } = req.body;

//   // Call the settings model to verify information
//   model.changeUserModel(curUser, username, password, (result) => {
//     if (result.success)
//       res.status(200).json({ success: true });
//     else
//       res.status(401).json({ success: false, message: result.message });
//   });
// });

// // Settings post request for delete account
// app.post('/deleteaccount', (req, res) => {
//   const { curUser, password } = req.body;

//   model.deleteAccountModel(curUser, password, (result) => {
//     if (result.success)
//       res.status(200).json({ success: true });
//     else
//       res.status(400).json({ success: false, message: result.message });
//   });
// });

// // cv process post request
// app.post('/cvprocess', function(req, res) {
//   try {
//     // Verify and decode the JWT token to extract user information
//     const token = req.headers.authorization.split(' ')[1];
//     const decoded = jwt.verify(token, 'This_1_Is_2_A_3_Secret_4!'); // Replace 'your_secret_key' with your actual secret key

//     // Extract user's profile email from the decoded token
//     const profileEmail = decoded.profile_email;

//     // Initialize cvData object
//     const cvData = {
//       page1: {},
//       page2: {},
//       page3: {},
//       page4: {}
//     };

//     // Check if the request contains data for the first page
//     if (req.body.cv_firstname !== undefined) {
//       cvData.page1 = {
//         cv_firstname: req.body.cv_firstname,
//         cv_lastname: req.body.cv_lastname,
//         cv_phonenumber: req.body.cv_phonenumber,
//         cv_email: req.body.cv_email, // Associate cv_email with CV data
//         cv_country: req.body.cv_country
//       };
//       console.log('Data for page 1 received and logged:', cvData.page1);
//     }

//     // Check if the request contains data for the second page
//     if (req.body.cv_colour !== undefined) {
//       cvData.page2 = {
//         cv_colour: req.body.cv_colour
//       };
//       console.log('Data for page 2 received and logged:', cvData.page2);
//     }

//     if (req.body.cv_mbti !== undefined) {
//       cvData.page3 = {
//         cv_mbti: req.body.cv_mbti,
//         cv_about: req.body.cv_about,
//       };
//       console.log('Data for page 3 received and logged:', cvData.page3);
//     }

//     if (req.body.cv_video !== undefined){
//       cvData.page4 = {
//         cv_video: req.body.cv_video
//       };
//       console.log('Data for page 4 received and logged:', cvData.page4);
//     }

//     // Call cvModel with cvData and profileEmail
//     model.cvModel(cvData, profileEmail, (response) => {
//       // Send response back to the client
//       res.status(200).json(response);
//     });
//   } catch (error) {
//     console.error('Error handling CV data:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// // add post post request
// app.post('/addpost', function(req, res) {

//   // Verify and decode the JWT token to extract user information
//   const token = req.headers.authorization.split(' ')[1];
//   const decoded = jwt.verify(token, 'This_1_Is_2_A_3_Secret_4!'); // Replace 'your_secret_key' with your actual secret key

//   // Extract user's profile email from the decoded token
//   const profileEmail = decoded.profile_email;

//   var jobPostData = {
//       job_post_title: req.body.job_post_title,
//       job_post_category: req.body.job_post_category,
//       job_post_date: req.body.job_post_date,
//       job_post_description: req.body.job_post_description,
//       job_post_image: req.body.job_post_image
//   };
//   console.log('Job post data:', jobPostData);


//   // Validate the presence of required fields
//   if (!jobPostData.job_post_title || !jobPostData.job_post_category || !jobPostData.job_post_date || !jobPostData.job_post_description) {
//       console.error('Missing required fields');
//       return res.status(400).json({ message: 'Missing required fields' });
//   }

//   model.addPostModel(jobPostData, profileEmail, function(response) {
//       if (!response) {
//           console.error('Error adding post:', err);
//           return res.status(500).json({ message: 'Failed to add post. Please try again.' });
//       }

//       // If no error, send success response
//       res.status(200).json({ message: 'Job post data submitted successfully' });
//       console.log('Job post data submitted successfully:', response);
//   });
// });


// // add post post request
// app.post('/wallet', function(req, res) {
//   console.log('Request body:', req.body); // Log the entire request body
//   var wallet_title = req.body.wallet_title; // Extract wallet_title from request body
//   console.log('Wallet title:', wallet_title); // Log the extracted wallet_title

//   // Call the model with walletData and a callback function to handle the response
//   model.walletModel(wallet_title, function(result){
//     if (!result.success) {
//       console.error('Error creating wallet:', result.error);
//       return res.status(500).json({ message: 'Failed to create wallet. Please try again.' });
//     }

//     // If no error, send success response
//     res.status(200).json({ message: 'Wallet submitted successfully', data: result.data });
//     console.log('Wallet submitted successfully:', result);
//   });
// });

// Graceful shutdown functionality for database connection
// function gracefulShutdown() {
//   pool.end().then(() => {
//     console.log('Pool has been closed');
//     process.exit(0);
//   });
// }

// If the server is killed in anyway, close the pool
// process.on('SIGINT', gracefulShutdown);
// process.on('SIGTERM', gracefulShutdown);


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
