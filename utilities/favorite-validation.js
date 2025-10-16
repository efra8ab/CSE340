// week 6 enhancement
const { body, validationResult } = require("express-validator")

const validate = {}

validate.favoriteRules = () => {
  return [
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Missing vehicle id.")
      .isInt()
      .withMessage("Invalid vehicle id.")
  ]
}

validate.checkFavoriteData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Vehicle could not be saved.")
    const redirectTo = req.body.redirectTo || "/account/favorites"
    return res.redirect(redirectTo)
  }
  next()
}

validate.removeRules = () => {
  return [
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Missing vehicle id.")
      .isInt()
      .withMessage("Invalid vehicle id.")
  ]
}

validate.checkRemoveData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Vehicle could not be removed.")
    return res.redirect("/account/favorites")
  }
  next()
}

module.exports = validate
