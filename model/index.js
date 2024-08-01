// model/index.js
var signinModel = require('./signin');
var registerModel = require('./register');
var changePasswordModel = require('./changepassword');
var deleteAccountModel = require('./deleteaccount');
const selectModel = require('./select');
var addPostModel = require('./addpost');

module.exports = 
{
    signinModel,
    registerModel,
    changePasswordModel,
    deleteAccountModel,
    selectModel,
    addPostModel,
};