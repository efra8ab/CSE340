// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build vehicle detail view
router.get("/detail/:inv_id", invController.buildDetailView)

// Management landing (access via /inv/)
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
);

// Deliver "Add Classification" view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassificationView)
);

// Deliver "Add Inventory" view (Task 3 placeholder)
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventoryView)
);


// Route to add a new classification
router.post(
  "/classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to add a new inventory item
router.post(
  "/inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;