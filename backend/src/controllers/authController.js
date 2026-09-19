const bcrypt = require("bcrypt");
const pool = require("../config/db");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // checking if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // hash password
    const hashedPasssword = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, role`,
      [name, email, hashedPasssword],
    );
    const user = result.rows[0];
    res.status(201).json({
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "server error",
    });
  }
};

module.exports = registerUser;
