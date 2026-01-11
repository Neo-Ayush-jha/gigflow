const Bid = require("../models/Bid");
const Gig = require("../models/Gig");

exports.placeBid = async (req, res) => {
  const bid = await Bid.create({
    ...req.body,
    freelancerId: req.userId
  });
  res.json(bid);
};

exports.hireBid = async (req, res) => {
  const bid = await Bid.findById(req.params.bidId);
  await Gig.findByIdAndUpdate(bid.gigId, { status: "assigned" });

  await Bid.updateMany(
    { gigId: bid.gigId },
    { status: "rejected" }
  );

  bid.status = "hired";
  await bid.save();

  req.io.to(bid.freelancerId.toString()).emit("hired", {
    message: "You have been hired!"
  });

  res.json({ message: "Freelancer hired" });
};