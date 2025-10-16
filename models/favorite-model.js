// week 6 enhancement
const pool = require("../database")

async function addFavorite(account_id, inv_id) {
  const sql = `
    INSERT INTO account_favorite (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT (account_id, inv_id) DO NOTHING
    RETURNING favorite_id
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result.rows[0]
}

async function removeFavorite(account_id, inv_id) {
  const sql = `
    DELETE FROM account_favorite
    WHERE account_id = ${account_id} AND inv_id = ${inv_id}
    RETURNING favorite_id
  `
  const result = await pool.query(sql)
  return result.rows[0]
}

async function getFavoritesForAccount(account_id) {
  const sql = `
    SELECT f.favorite_id,
           f.inv_id,
           i.inv_make,
           i.inv_model,
           i.inv_year,
           i.inv_thumbnail,
           i.inv_price
    FROM account_favorite f
    JOIN inventory i ON i.inv_id = f.inv_id
    WHERE f.account_id = $1
    ORDER BY f.created_at DESC
  `
  const result = await pool.query(sql, [account_id])
  return result.rows
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesForAccount
}
