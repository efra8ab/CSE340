// required stuff

const accountModel = require("../models/account-model")
const utilities = require('../utilities/')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
require('dotenv').config()

const setAuthCookie = (res, accountData) => {
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
  const baseOptions = { httpOnly: true, maxAge: 3600 * 1000 }
  const options = process.env.NODE_ENV === 'development'
    ? baseOptions
    : { ...baseOptions, secure: true }
  res.cookie("jwt", accessToken, options)
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account management view (default /account)
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  const accountId = Number(req.params.accountId)
  const loggedInAccount = res.locals.accountData
  if (!Number.isInteger(accountId)) {
    return next({ status: 400, message: "Invalid account identifier." })
  }
  if (!loggedInAccount || loggedInAccount.account_id !== accountId) {
    req.flash("notice", "You are not authorized to edit that account.")
    return res.redirect("/account/")
  }
  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(accountId)
  if (!accountData || accountData instanceof Error) {
    return next({ status: 404, message: "Account not found." })
  }
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    accountErrors: null,
    passwordErrors: null
  })
}

/* ****************************************
*  Handle account information update
* *************************************** */
async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const accountId = Number(account_id)
  const loggedInAccount = res.locals.accountData
  if (!loggedInAccount || loggedInAccount.account_id !== accountId) {
    req.flash("notice", "You are not authorized to update that account.")
    return res.redirect("/account/")
  }
  try {
    const updatedAccount = await accountModel.updateAccount(
      accountId,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updatedAccount) {
      setAuthCookie(res, updatedAccount)
      res.locals.accountData = updatedAccount
      res.locals.loggedin = 1
      req.flash("notice", "Account information updated.")
    } else {
      const currentAccount = await accountModel.getAccountById(accountId)
      res.locals.accountData = currentAccount
      req.flash("notice", "No changes were made to your account.")
    }
  } catch (error) {
    const currentAccount = await accountModel.getAccountById(accountId)
    res.locals.accountData = currentAccount
    req.flash("notice", "Sorry, we could not update your account information.")
  }
  return res.redirect("/account/")
}

/* ****************************************
*  Handle password change
* *************************************** */
async function updateAccountPassword(req, res, next) {
  const { account_id, account_password } = req.body
  const accountId = Number(account_id)
  const loggedInAccount = res.locals.accountData
  if (!loggedInAccount || loggedInAccount.account_id !== accountId) {
    req.flash("notice", "You are not authorized to update that account.")
    return res.redirect("/account/")
  }
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updateAccountPassword(accountId, hashedPassword)

    if (result) {
      const accountData = await accountModel.getAccountById(accountId)
      if (accountData && !(accountData instanceof Error)) {
        setAuthCookie(res, accountData)
        res.locals.accountData = accountData
        res.locals.loggedin = 1
      }
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "No changes were made to the password.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, we could not update your password.")
  }
  return res.redirect("/account/")
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      setAuthCookie(res, accountData)
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildUpdateAccount,
  updateAccount,
  updateAccountPassword,
  accountLogout
}
