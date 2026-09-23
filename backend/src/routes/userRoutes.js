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
  (req, res, next) => {
    upload.single("profile_picture")(req, res, (error) => {
      if (error) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Image size must be less than 5MB",
          });
        }

        return res.status(400).json({
          message: error.message || "Invalid image upload",
        });
      }

      next();
    });
  },
  uploadProfilePicture,
);

module.exports = router;
