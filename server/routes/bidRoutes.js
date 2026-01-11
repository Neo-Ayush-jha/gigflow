const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { placeBid, hireBid } = require("../controllers/bidController");

router.post("/", auth, placeBid);
router.patch("/:bidId/hire", auth, hireBid);

module.exports = router;