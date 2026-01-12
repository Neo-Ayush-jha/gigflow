const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { register, login, getProfile, updateProfile } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);

module.exports = router;