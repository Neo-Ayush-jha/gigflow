const Gig = require("../models/Gig");

exports.createGig = async (req, res) => {
  try {
    const { title, description, budget, category, skills, deadline } = req.body;

    if (!title || !description || !budget || !category || !skills || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      category,
      skills,
      deadline,
      clientId: req.userId,
      status: 'open',
      bidsCount: 0,
    });

    res.status(201).json({
      id: gig._id,
      title: gig.title,
      description: gig.description,
      budget: gig.budget,
      category: gig.category,
      skills: gig.skills,
      status: gig.status,
      clientId: gig.clientId,
      createdAt: gig.createdAt,
      deadline: gig.deadline,
      bidsCount: gig.bidsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ status: 'open' })
      .populate('clientId', 'name email avatar');
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId)
      .populate('clientId', 'name email avatar bio rating');
    
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGigsByClient = async (req, res) => {
  try {
    const gigs = await Gig.find({ clientId: req.userId });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.clientId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.gigId,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedGig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.clientId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Gig.findByIdAndDelete(req.params.gigId);
    res.json({ message: "Gig deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};