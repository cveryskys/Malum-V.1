const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Checks if the given Roblox username exists in the staff_verification table.
 * @param {string} username 
 * @returns {Promise<boolean>}
 */
async function isUserVerified(username) {
  try {
    const res = await db.query(
      `SELECT verified FROM staff_verification WHERE roblox_username = $1`,
      [username]
    );

    if (res.rows.length === 0) return false;

    return res.rows[0].verified === true;
  } catch (err) {
    console.error("❌ Error checking verification:", err);
    return false;
  }
}

/**
 * Marks the user as verified in the database.
 * @param {string} username - Roblox username
 * @returns {Promise<boolean>}
 */
async function markUserAsVerified(username) {
  try {
    const res = await db.query(
      `UPDATE staff_verification SET verified = true WHERE roblox_username = $1`,
      [username]
    );
    return res.rowCount > 0;
  } catch (err) {
    console.error("❌ Error marking user as verified:", err);
    return false;
  }
}

/**
 * Retrieves all users marked as verified.
 * @returns {Promise<Array>}
 */
async function getAllVerifiedUsers() {
  try {
    const res = await db.query(
      `SELECT * FROM staff_verification WHERE verified = true`
    );
    return res.rows;
  } catch (err) {
    console.error("❌ Error fetching verified users:", err);
    return [];
  }
}

/**
 * Returns the entire staff_verification table.
 * @returns {Promise<Array>}
 */
async function getAllStaffEntries() {
  try {
    const res = await db.query(`SELECT * FROM staff_verification`);
    return res.rows;
  } catch (err) {
    console.error("❌ Error fetching staff entries:", err);
    return [];
  }
}

module.exports = {
  isUserVerified,
  markUserAsVerified,
  getAllVerifiedUsers,
  getAllStaffEntries,
};
