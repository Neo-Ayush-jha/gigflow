const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createGig, getGigs } = require("../controllers/gigController");

router.get("/", getGigs);
router.post("/", auth, createGig);

module.exports = router;