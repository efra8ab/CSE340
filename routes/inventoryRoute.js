// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;

// Route to build vehicle detail view
router.get("/detail/:invId", invController.buildByInvId);

// Route to 500 test
router.get("/trigger-500", invController.trigger500);