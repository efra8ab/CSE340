const { body, validationResult } = require("express-validator");
const utilities = require("."); // your utilities/index.js
const invModel = require("../models/inventory-model");

const invValidate = {};

/* Rules */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required.")
      .isLength({ min: 3, max: 30 })
      .withMessage("Classification name must be 3–30 characters.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Only letters and numbers allowed (no spaces or special characters)."
      )
      .custom(async (name) => {
        const exists = await invModel.checkExistingClassification(name);
        if (exists) {
          throw new Error("That classification already exists.");
        }
      }),
  ];
};

/* Inventory rules */
invValidate.inventoryRules = () => {
  const currentYear = new Date().getFullYear() + 1; // allow next model year
  return [
    body("classification_id")
      .trim()
      .notEmpty().withMessage("Please select a classification.")
      .isInt({ min: 1 }).withMessage("Classification is invalid."),
    body("inv_make")
      .trim().escape()
      .notEmpty().withMessage("Make is required.")
      .isLength({ min: 2, max: 50 }).withMessage("Make must be 2–50 characters."),
    body("inv_model")
      .trim().escape()
      .notEmpty().withMessage("Model is required.")
      .isLength({ min: 1, max: 50 }).withMessage("Model must be 1–50 characters."),
    body("inv_year")
      .trim()
      .notEmpty().withMessage("Year is required.")
      .isInt({ min: 1900, max: currentYear }).withMessage(`Year must be between 1900 and ${currentYear}.`),
    body("inv_description")
      .trim().escape()
      .notEmpty().withMessage("Description is required.")
      .isLength({ min: 8 }).withMessage("Description must be at least 8 characters."),
    body("inv_image")
      .trim()
      .notEmpty().withMessage("Image path/URL is required.")
      .isLength({ max: 255 }).withMessage("Image path is too long."),
    body("inv_thumbnail")
      .trim()
      .notEmpty().withMessage("Thumbnail path/URL is required.")
      .isLength({ max: 255 }).withMessage("Thumbnail path is too long."),
    body("inv_price")
      .trim()
      .notEmpty().withMessage("Price is required.")
      .isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles")
      .trim()
      .notEmpty().withMessage("Miles is required.")
      .isInt({ min: 0 }).withMessage("Miles must be 0 or greater."),
    body("inv_color")
      .trim().escape()
      .notEmpty().withMessage("Color is required.")
      .isLength({ min: 3, max: 50 }).withMessage("Color must be 3–50 characters.")
  ];
};

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    // fetch classifications to rebuild the select
    const classData = await require("../models/inventory-model").getClassifications();
    const classifications = classData.rows || [];
    return res.status(400).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors,
      classifications,
      ...req.body
    });
  }
  next();
};

invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const { classification_name = "" } = req.body;
    return res.status(400).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
  }
  next();
};

module.exports = invValidate;
