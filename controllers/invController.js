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
    return res.render("./inventory/management", {
      title: "Management",
      nav,
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

    return res.render("./inventory/detail", { title, nav, detail });
  } catch (err) {
    return next(err);
  }
};

 module.exports = invCont;