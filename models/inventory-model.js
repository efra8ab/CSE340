const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* *********************************
* Check for existing classification
* ***********************************/

async function checkExistingClassification(classification_name) {
  const sql = 'SELECT 1 FROM public.classification WHERE LOWER(classification_name) = LOWER($1)';
  const result = await pool.query(sql, [classification_name]);
  return result.rowCount > 0;
}

/* ****************************
*   Add a new classification
* ****************************/

async function addClassification(classification_name) {
  const sql = 'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id, classification_name';
  const result = await pool.query(sql, [classification_name]);
  return result.rows[0];
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
 *  Get vehicle details by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getVehicleById error " + error);
  }
}

/* ****************************
*   Add a new inventory item
* ****************************/
async function addInventory({
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
}) {
  const sql = `
    INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id, inv_make, inv_model, inv_year
  `;
  const params = [
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
  ];
  const result = await pool.query(sql, params);
  return result.rows[0];
}

/* ***************************
 *  Get a single classification name by id
 * ************************** */
async function getClassificationNameById(classification_id) {
  const result = await pool.query(
    "SELECT classification_name FROM public.classification WHERE classification_id = $1",
    [classification_id]
  );
  return result.rows[0];
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, checkExistingClassification, addClassification, addInventory, getClassificationNameById};
