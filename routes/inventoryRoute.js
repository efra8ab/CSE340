// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const classificationValidate = require('../utilities/classification-validation')
const inventoryValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities/")

router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
)

// GET: Add Inventory form
router.get("/add-inventory", invController.buildAddInventory)

// POST: Process Add Inventory submission
router.post(
  "/add-inventory",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Route to 500 test
router.get("/trigger-500", utilities.handleErrors(invController.trigger500));

//process add-classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

router.post(
    "/add-classification",
    classificationValidate.classificationRules(),
    classificationValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

module.exports = router;