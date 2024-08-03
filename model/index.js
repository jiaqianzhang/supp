// model/index.js
var signinModel = require('./signin');
var registerModel = require('./register');
var changePasswordModel = require('./changepassword');
var deleteAccountModel = require('./deleteaccount');
const selectModel = require('./select');
var addPostModel = require('./addpost');
const reviewModel = require('./review');
// const deleteReviewModel = require('./deletereview');

module.exports = 
{
    signinModel,
    registerModel,
    changePasswordModel,
    deleteAccountModel,
    selectModel,
    addPostModel,
    reviewModel,
    // deleteReviewModel,
};