const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const User = require("../models/User");

exports.placeBid = async (req, res) => {
  try {
    const { gigId, amount, message, deliveryDays } = req.body;

    if (!gigId || !amount || !message || !deliveryDays) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if freelancer already bid on this gig
    const existingBid = await Bid.findOne({ gigId, freelancerId: req.userId });
    if (existingBid) {
      return res.status(400).json({ message: "You already bid on this gig" });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.userId,
      amount,
      message,
      deliveryDays,
      status: 'pending',
    });

    // Increment bidsCount
    await Gig.findByIdAndUpdate(gigId, { $inc: { bidsCount: 1 } });

    res.status(201).json({
      id: bid._id,
      gigId: bid.gigId,
      freelancerId: bid.freelancerId,
      amount: bid.amount,
      message: bid.message,
      deliveryDays: bid.deliveryDays,
      status: bid.status,
      createdAt: bid.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBidsForGig = async (req, res) => {
  try {
    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'name email avatar rating completedJobs skills');

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBidsForFreelancer = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.userId })
      .populate('gigId', 'title description budget category clientId');

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.hireBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('freelancerId');
    
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const gig = await Gig.findById(bid.gigId);

    if (gig.clientId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update gig status and set freelancer
    await Gig.findByIdAndUpdate(bid.gigId, { status: 'in-progress' });

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Reject all other bids for this gig
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: req.params.bidId } },
      { status: 'rejected' }
    );

    // Emit event to freelancer
    req.io.to(bid.freelancerId._id.toString()).emit('bid-accepted', {
      message: 'Your bid has been accepted!',
      gigId: bid.gigId,
      amount: bid.amount,
    });

    res.json({ message: 'Freelancer hired successfully', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const gig = await Gig.findById(bid.gigId);

    if (gig.clientId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json({ message: 'Bid rejected', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bid.freelancerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: "Can only withdraw pending bids" });
    }

    await Bid.findByIdAndDelete(req.params.bidId);

    // Decrement bidsCount
    await Gig.findByIdAndUpdate(bid.gigId, { $inc: { bidsCount: -1 } });

    res.json({ message: 'Bid withdrawn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};