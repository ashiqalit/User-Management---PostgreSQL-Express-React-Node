const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const { getAllUsers } = require("../controllers/adminController");

const router = express.Router();

router.get("/users", protect, requireAdmin, getAllUsers);

module.exports = router;
