const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { 
  createGig, 
  getGigs, 
  getGigById,
  getGigsByClient,
  updateGig,
  deleteGig
} = require("../controllers/gigController");

router.get("/", getGigs);
router.get("/client/my-gigs", auth, getGigsByClient);
router.get("/:gigId", getGigById);
router.post("/", auth, createGig);
router.patch("/:gigId", auth, updateGig);
router.delete("/:gigId", auth, deleteGig);

module.exports = router;