

const { body, validationResult } = require("express-validator")
const utilities = require(".")

const validate = {}

validate.inventoryRules = () => {
  return [
    body("classification_id").notEmpty().withMessage("Choose a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required.").isLength({ max: 50 }).withMessage("Make must be 50 chars or less."),
    body("inv_model").trim().notEmpty().withMessage("Model is required.").isLength({ max: 50 }).withMessage("Model must be 50 chars or less."),
    body("inv_year").notEmpty().withMessage("Year is required.").isInt({ min: 1900, max: 2100 }).withMessage("Year must be between 1900 and 2100."),
    body("inv_description").trim().notEmpty().withMessage("Description is required.").isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),
    body("inv_image").trim().notEmpty().withMessage("Main image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail image path is required."),
    body("inv_price").notEmpty().withMessage("Price is required.").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").notEmpty().withMessage("Miles is required.").isInt({ min: 0 }).withMessage("Miles must be zero or greater."),
    body("inv_color").trim().notEmpty().withMessage("Color is required.").isLength({ max: 30 }).withMessage("Color must be 30 chars or less."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
      classification_id: req.body.classification_id || "",
      inv_make: req.body.inv_make || "",
      inv_model: req.body.inv_model || "",
      inv_year: req.body.inv_year || "",
      inv_description: req.body.inv_description || "",
      inv_image: req.body.inv_image || "",
      inv_thumbnail: req.body.inv_thumbnail || "",
      inv_price: req.body.inv_price || "",
      inv_miles: req.body.inv_miles || "",
      inv_color: req.body.inv_color || "",
    })
  }
  next()
}

module.exports = validate