const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validate = {};

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Only letters and numbers allowed — no spaces or special characters.")
      .isLength({ max: 50 })
      .withMessage("Classification name must be 50 characters or less."),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

module.exports = validate;