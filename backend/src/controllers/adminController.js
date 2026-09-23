const bcrypt = require("bcrypt");
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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, role, profile_picture, created_at, updated_at
            FROM users
            WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, profile_picture, created_at`,
      [name, email, hashedPassword, role],
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // check whether user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = existingUser.rows[0];

    // Validate role
    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Prevent an admin from changing their own role
    if (Number(id) === req.user.id && role && role !== currentUser.role) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    // Prevent removing the last administrator
    if (currentUser.role === "admin" && role === "user") {
      const adminCountResult = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin'",
      );

      const adminCount = Number(adminCountResult.rows[0].count);

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "At least one administrator must remain",
        });
      }
    }

    // check email uniqueness if email has being changed
    if (email) {
      const emailExists = await pool.query(
        "SELECT id FROM users WHERE email = $1 and id != $2",
        [email, id],
      );

      if (emailExists.rows.length > 0) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }
    }

    // build update values
    let hashedPassword = existingUser.rows[0].password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedName = name || existingUser.rows[0].name;
    const updatedEmail = email || existingUser.rows[0].email;
    const updatedRole = role || existingUser.rows[0].role;

    const result = await pool.query(
      `UPDATE users
        SET name = $1,
            email = $2,
            password = $3,
            role = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, name, email, role, profile_picture, created_at, updated_at`,
      [updatedName, updatedEmail, hashedPassword, updatedRole, id],
    );

    res.status(200).json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent admin from deleting themselves
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const result = await pool.query(
      `DELETE FROM users
        WHERE id = $1
        RETURNING id, name, email, role`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: result.rows[0],
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
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
