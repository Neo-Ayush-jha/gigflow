const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { 
  placeBid, 
  hireBid,
  rejectBid,
  withdrawBid,
  getBidsForGig,
  getBidsForFreelancer
} = require("../controllers/bidController");

router.post("/", auth, placeBid);
router.get("/gig/:gigId", getBidsForGig);
router.get("/freelancer/my-bids", auth, getBidsForFreelancer);
router.patch("/:bidId/accept", auth, hireBid);
router.patch("/:bidId/reject", auth, rejectBid);
router.delete("/:bidId", auth, withdrawBid);

module.exports = router;