const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view by inv_id
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = Number(req.params.invId)
    if (!Number.isInteger(invId)) {
      return next({ status: 400, message: "Invalid vehicle id" })
    }

    const vehicle = await invModel.getVehicleById(invId)
    if (!vehicle) {
      return next({ status: 404, message: "Vehicle not found" })
    }

    const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`
    const nav = await utilities.getNav()
  
    res.render("inventory/details", { title, nav, vehicle })
  } catch (err) {
      next(err)
  }
}


/* ***************************
 *  Trigger a 500 error for testing
 * ************************** */
invCont.trigger500 = async function (req, res, next) {
  try {
    const err = new Error("Intentional test error (500)")
    err.status = 500
    return next(err) 
  } catch (e) {
    return next(e)
  }
}

module.exports = invCont