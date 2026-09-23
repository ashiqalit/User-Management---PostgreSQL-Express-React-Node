const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, profile_picture, created_at
            FROM users
            WHERE id = $1`,
      [req.user.id],
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

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const cleanName = name.trim();

    const result = await pool.query(
      `UPDATE users
        SET name = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, email, role, profile_picture, created_at, updated_at`,
      [cleanName, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    // Get the user's current profile picture
    const existingUser = await pool.query(
      `SELECT profile_picture
       FROM users
       WHERE id = $1`,
      [req.user.id],
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const oldProfilePicture = existingUser.rows[0].profile_picture;

    const newProfilePicture = req.file.filename;

    // Update database with the new picture
    const result = await pool.query(
      `UPDATE users
       SET profile_picture = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role,
                 profile_picture, created_at, updated_at`,
      [newProfilePicture, req.user.id],
    );

    // Delete the old picture after database update
    if (oldProfilePicture) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads",
        oldProfilePicture,
      );

      fs.unlink(oldFilePath, (error) => {
        if (error && error.code !== "ENOENT") {
          console.error("Failed to delete old profile picture:", error);
        }
      });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
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
  getProfile,
  updateProfile,
  uploadProfilePicture,
};
