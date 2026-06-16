const Campaign = require("../models/Campaign");

// Create new awareness campaign
const createCampaign = async (req, res) => {
  try {
    const {
      campaignName,
      targetGroup,
      fakeEmailSubject,
      fakeEmailContent,
      totalTargets,
    } = req.body;

    if (
      !campaignName ||
      !targetGroup ||
      !fakeEmailSubject ||
      !fakeEmailContent
    ) {
      return res.status(400).json({
        message: "Please fill all required campaign fields",
      });
    }

    const campaign = await Campaign.create({
      user: req.user.id,
      campaignName,
      targetGroup,
      fakeEmailSubject,
      fakeEmailContent,
      totalTargets: totalTargets || 0,
      ignoredCount: totalTargets || 0,
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({
      message: "Server error while creating campaign",
    });
  }
};

// Get campaigns for logged-in user
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({
      message: "Server error while fetching campaigns",
    });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
};