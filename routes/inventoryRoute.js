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

// Protect administrative routes for authorized accounts only
router.use(utilities.requireEmployeeOrAdmin)

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

// Deliver "Add Inventory" view 
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

// Route to classification_id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build the Edit Inventory view (by inventory id)
router.get('/edit/:inv_id', utilities.handleErrors(invController.buildEditInventoryView))

// Route to handle the incoming requests
router.post("/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory))

// Route to build the Delete Inventory confirmation view (by inventory id)
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteInventoryView)
)

// Route to perform the Delete Inventory action
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;
