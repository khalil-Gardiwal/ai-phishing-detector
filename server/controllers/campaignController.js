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

    const targetsNumber = Number(totalTargets) || 0;

    const campaign = await Campaign.create({
      user: req.user.id,
      campaignName,
      targetGroup,
      fakeEmailSubject,
      fakeEmailContent,
      totalTargets: targetsNumber,
      ignoredCount: targetsNumber,
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

// Get one campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Get campaign by ID error:", error);
    res.status(500).json({
      message: "Server error while fetching campaign",
    });
  }
};

// Update campaign training statistics manually
const updateCampaignStats = async (req, res) => {
  try {
    const { openedCount, clickedCount, ignoredCount, status } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    if (openedCount !== undefined) {
      campaign.openedCount = Number(openedCount);
    }

    if (clickedCount !== undefined) {
      campaign.clickedCount = Number(clickedCount);
    }

    if (ignoredCount !== undefined) {
      campaign.ignoredCount = Number(ignoredCount);
    }

    if (status !== undefined) {
      campaign.status = status;
    }

    await campaign.save();

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Update campaign stats error:", error);
    res.status(500).json({
      message: "Server error while updating campaign statistics",
    });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStats,
};