const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
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