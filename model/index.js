// model/index.js
var signinModel = require('./signin');
var registerModel = require('./register');
var changePasswordModel = require('./changepassword');
var deleteAccountModel = require('./deleteaccount');
// var { changeUserModel, deleteAccountModel } = require('./settings');

module.exports = 
{
    signinModel,
    registerModel,
    changePasswordModel,
    deleteAccountModel
};