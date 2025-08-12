const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build Add Inventory form
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image-available.png",
      inv_thumbnail: "/images/vehicles/no-image-available-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Handle Add Inventory POST
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  try {
    const result = await invModel.addVehicle({
      classification_id: Number(classification_id),
      inv_make: inv_make.trim(),
      inv_model: inv_model.trim(),
      inv_year: Number(inv_year),
      inv_description: inv_description.trim(),
      inv_image: inv_image.trim(),
      inv_thumbnail: inv_thumbnail.trim(),
      inv_price: Number(inv_price),
      inv_miles: Number(inv_miles),
      inv_color: inv_color.trim(),
    })

    req.flash("notice", `Vehicle "${result.inv_year} ${result.inv_make} ${result.inv_model}" added successfully.`)
    return res.redirect("/inv/")
  } catch (err) {
    console.error("addInventory error:", err)
    try {
      const nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      req.flash("notice", "Sorry, we couldn’t add that vehicle.")
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: null,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      })
    } catch (innerErr) {
      return next(innerErr)
    }
  }
}

/* ***************************
 *  Build Add Classification form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Handle Add Classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    req.flash("notice", `Classification "${result.classification_name}" added successfully.`)
    return res.redirect("/inv/add-classification")
  } catch (err) {
    console.error("addClassification error:", err)
    try {
      const nav = await utilities.getNav()
      req.flash("notice", "Sorry, we couldn’t add that classification. It may already exist.")
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        classification_name
      })
    } catch (innerErr) {
      return next(innerErr)
    }
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()

  let className
  if (Array.isArray(data) && data.length > 0) {
    className = data[0].classification_name
  } else {
    // No vehicles
    const cls = await invModel.getClassificationById(classification_id)
    if (!cls) {
      return next({ status: 404, message: "Classification not found" })
    }
    className = cls.classification_name
  }

  res.render("inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  })
} catch (err) {
  next(err)
}
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

invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav
    })
  } catch (err) {
    next(err)
  }
}


module.exports = invCont