// needed resources

const express = require('express');
const router = new express.Router();
const accountController = require('../controllers/accountController')
const utilities = require('../utilities/');
const { post } = require('./static');
const regValidate = require("../utilities/account-validation");

// route to build login section
router.get('/login', utilities.handleErrors(accountController.buildLogin))
// route to build registration 
router.get('/registration', utilities.handleErrors(accountController.buildRegister))
// route to post registration of user
router.post('/registration',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;