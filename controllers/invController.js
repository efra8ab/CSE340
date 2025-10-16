const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = Number(req.params.classificationId);
    if (!Number.isFinite(classification_id)) {
      return next({ status: 400, message: "Invalid classification id." });
    }

    const data = await invModel.getInventoryByClassificationId(classification_id);
    const nav = await utilities.getNav();

    // Determine classification name even if there are no inventory rows
    let className = "vehicles";
    if (Array.isArray(data) && data.length > 0) {
      className = data[0].classification_name;
    } else {
      const classRow = await invModel.getClassificationNameById(classification_id);
      if (classRow && classRow.classification_name) {
        className = classRow.classification_name;
      }
    }

    // Build grid (utilities should handle an empty array by showing a friendly message)
    const grid = await utilities.buildClassificationGrid(Array.isArray(data) ? data : []);

    return res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (err) {
    return next(err);
  }
};

/* ****************************
*   Add classification (form submit)
* *****************************/
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;

    const saved = await invModel.addClassification(classification_name);

    // Success: rebuild nav so the new classification appears immediately
    const nav = await utilities.getNav();
    req.flash(
      "notice",
      `Classification "${saved.classification_name}" created.`
    );
    return res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      errors: [],
      classification_name: "",
    });
  } catch (err) {
    if (err.code === "23505") {
      const nav = await utilities.getNav();
      req.flash("notice", "Classification already exists.");
      return res.status(409).render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [],
        classification_name: req.body.classification_name || "",
      });
    }
    return next(err);
  }
};

/* ***************************
 *  Build management view (add classification form)
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    return res.render("./inventory/management", {
      title: "Management",
      nav,
      classificationSelect,
      errors: [],
      classification_name: ""
    });
  } catch (err) {
    return next(err);
  }
};

/* Build add-classification view */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    return res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [],
      classification_name: ""
    });
  } catch (err) {
    return next(err);
  }
};

/* Build add-inventory view */
invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classData = await invModel.getClassifications();
    const classifications = classData.rows || [];
    return res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classifications,
      errors: [],
      // defaults for sticky form
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: ""
    });
  } catch (err) {
    return next(err);
  }
};

/* ****************************
*   Add inventory (form submit)
* *****************************/
invCont.addInventory = async function (req, res, next) {
  try {
    const payload = {
      classification_id: parseInt(req.body.classification_id, 10),
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: parseInt(req.body.inv_year, 10),
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: parseFloat(req.body.inv_price),
      inv_miles: parseInt(req.body.inv_miles, 10),
      inv_color: req.body.inv_color
    };

    const saved = await invModel.addInventory(payload);

    // Success: rebuild nav and render management with success
    const nav = await utilities.getNav();
    req.flash("notice", `Vehicle "${saved.inv_year} ${saved.inv_make} ${saved.inv_model}" created.`);
    return res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      errors: []
    });
  } catch (err) {
    return next(err);
  }
};

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id);
    if (Number.isNaN(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle id." });
    }

    // one query that returns the specific vehicle row
    const data = await invModel.getVehicleById(inv_id);
    if (!data || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    const vehicle = data[0];
    const nav = await utilities.getNav();
    const detail = await utilities.buildVehicleDetail(vehicle);
    const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
    const redirectTo = req.originalUrl;

    return res.render("./inventory/detail", {
      title,
      nav,
      detail,
      vehicle,
      redirectTo
    });
  } catch (err) {
    return next(err);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id);
    if (!Number.isFinite(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle id." });
    }
    const data = await invModel.getVehicleById(inv_id);
    if (!Array.isArray(data) || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    const v = data[0];
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(
      v.classification_id
    );
    const title = `Edit ${v.inv_year} ${v.inv_make} ${v.inv_model}`;

    return res.render("./inventory/edit-inventory", {
      title,
      nav,
      errors: [],
      classificationSelect,
      inv_id: v.inv_id,
      classification_id: v.classification_id,
      inv_make: v.inv_make,
      inv_model: v.inv_model,
      inv_year: v.inv_year,
      inv_description: v.inv_description,
      inv_image: v.inv_image,
      inv_thumbnail: v.inv_thumbnail,
      inv_price: v.inv_price,
      inv_miles: v.inv_miles,
      inv_color: v.inv_color,
    });
  } catch (err) {
    return next(err);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const toInt = (v) => parseInt(Array.isArray(v) ? v[0] : v, 10)
  const toFloat = (v) => parseFloat(Array.isArray(v) ? v[0] : v)

  const invId  = toInt(inv_id)
  const classId = toInt(classification_id)
  const year   = toInt(inv_year)
  const miles  = toInt(inv_miles)
  const price  = toFloat(inv_price)

  const updateResult = await invModel.updateInventory(
    invId,                
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    price,                
    year,                 
    miles,                
    inv_color,
    classId               
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classId)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: invId,
      inv_make,
      inv_model,
      inv_year: year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: price,
      inv_miles: miles,
      inv_color,
      classification_id: classId
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id);
    if (!Number.isFinite(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle id." });
    }

    const data = await invModel.getVehicleById(inv_id);
    if (!Array.isArray(data) || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    const v = data[0];
    const nav = await utilities.getNav();
    const title = `Delete ${v.inv_year} ${v.inv_make} ${v.inv_model}`;

    return res.render("./inventory/delete-confirm", {
      title,
      nav,
      errors: [],
      inv_id: v.inv_id,
      inv_make: v.inv_make,
      inv_model: v.inv_model,
      inv_year: v.inv_year,
      inv_price: v.inv_price,
    });
  } catch (err) {
    return next(err);
  }
};

/* ***************************
 *  Delete Inventory Item (POST)
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(Array.isArray(req.body.inv_id) ? req.body.inv_id[0] : req.body.inv_id, 10);
    if (!Number.isFinite(inv_id)) {
      return next({ status: 400, message: "Invalid vehicle id." });
    }

    const result = await invModel.deleteInventory(inv_id);

    if (result) {
      req.flash("notice", "The vehicle was successfully deleted.");
      return res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (err) {
    return next(err);
  }
};

 module.exports = invCont;
