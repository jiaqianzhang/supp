// model/index.js
var signinModel = require('./signin');
var registerModel = require('./register');
// var { changeUserModel, deleteAccountModel } = require('./settings');

module.exports = 
{
    signinModel,
    registerModel
};