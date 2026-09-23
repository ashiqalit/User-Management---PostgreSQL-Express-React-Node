const express = require("express");

const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post(
  "/profile-picture",
  protect,
  upload.single("profile_picture"),
  uploadProfilePicture,
);

module.exports = router;
