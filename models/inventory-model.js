const pool = require("../database")

/* **************************+
* Get all classigication data
************************ */

async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = { getClassifications }


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
module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById };
