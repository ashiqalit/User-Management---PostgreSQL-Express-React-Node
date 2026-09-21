const pool = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, profile_picture, created_at, updated_at
            FROM users
            ORDER BY id ASC`,
    );
    res.status(200).json({
      users: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
    getAllUsers,
}