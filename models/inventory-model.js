const pool = require("../database")

/* **************************+
* Get all classigication data
************************ */

async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}


/* ***************************
 *  Get a single Vehicle by inventory_id
 * ************************** */

async function getVehicleById(inv_id) {
  const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`;
  const data = await pool.query(sql, [inv_id]);
  return data.rows[0];
}

/* ***************************
 *  Insert a new classification
 * ************************** */
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING *`;
  const data = await pool.query(sql, [classification_name]);
  return data.rows[0];
}

/* ***************************
 *  Insert a new vehicle
 * ************************** */
async function addVehicle(vehicle) {
  const sql = `
    INSERT INTO public.inventory (
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`;

  const params = [
    vehicle.classification_id,
    vehicle.inv_make,
    vehicle.inv_model,
    vehicle.inv_year,
    vehicle.inv_description,
    vehicle.inv_image,
    vehicle.inv_thumbnail,
    vehicle.inv_price,
    vehicle.inv_miles,
    vehicle.inv_color,
  ]

  const data = await pool.query(sql, params)
  return data.rows[0]
}

/* ***************************
 *  Get a single classification by id
 * ************************** */
async function getClassificationById(classification_id) {
  const sql = `SELECT * FROM public.classification WHERE classification_id = $1`;
  const data = await pool.query(sql, [classification_id]);
  return data.rows[0];
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getVehicleById,
    addClassification,
    addVehicle,
    getClassificationById
};
