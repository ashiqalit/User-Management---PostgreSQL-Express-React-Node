const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", protect, requireAdmin, getAllUsers);
router.get("/users/:id", protect, requireAdmin, getUserById);
router.post("/users", protect, requireAdmin, createUser);
router.put("/users/:id", protect, requireAdmin, updateUser);
router.delete("/users/:id", protect, requireAdmin, deleteUser);

module.exports = router;
