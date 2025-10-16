// needed resources

const express = require('express');
const router = new express.Router();
const accountController = require('../controllers/accountController')
const utilities = require('../utilities/');
const { post } = require('./static');
const regValidate = require("../utilities/account-validation");

// default account management view (/account/)
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

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

// deliver account update view
router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// process account information update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// process password change
router.post(
  "/update/password",
  utilities.checkLogin,
  regValidate.passwordChangeRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updateAccountPassword)
)

// Process logout
router.get(
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
)

module.exports = router;
