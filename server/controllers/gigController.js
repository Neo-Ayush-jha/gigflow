const Gig = require("../models/Gig");

exports.createGig = async (req, res) => {
  const gig = await Gig.create({
    ...req.body,
    ownerId: req.userId
  });
  res.json(gig);
};

exports.getGigs = async (req, res) => {
  const gigs = await Gig.find({ status: "open" });
  res.json(gigs);
};