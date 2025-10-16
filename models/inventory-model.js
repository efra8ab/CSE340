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

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1';
    const result = await pool.query(sql, [inv_id]);
    // Return number of rows deleted (1 if success, 0 if not found)
    return result.rowCount;
  } catch (error) {
    console.error('model error: ' + error);
    return 0;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  checkExistingClassification,
  addClassification,
  addInventory,
  getClassificationNameById,
  updateInventory,
  deleteInventory
};