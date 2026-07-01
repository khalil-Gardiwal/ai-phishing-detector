const crypto = require("crypto");
const Campaign = require("../models/Campaign");
const transporter = require("../config/emailTransporter");

const recalculateCampaignStats = (campaign) => {
  const recipients = campaign.recipients || [];

  campaign.totalTargets = recipients.length;
  campaign.clickedCount = recipients.filter((r) => r.clicked).length;
  campaign.notClickedCount = recipients.filter((r) => !r.clicked).length;

  return campaign;
};

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

    if (!campaignName || !targetGroup || !fakeEmailSubject || !fakeEmailContent) {
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
      clickedCount: 0,
      notClickedCount: targetsNumber,
      status: "Draft",
      recipients: [],
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({
      message: "Server error while creating campaign",
    });
  }
};

// Get campaigns for logged-in admin
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    for (const campaign of campaigns) {
      if (campaign.recipients && campaign.recipients.length > 0) {
        recalculateCampaignStats(campaign);
        await campaign.save();
      }
    }

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

    if (campaign.recipients && campaign.recipients.length > 0) {
      recalculateCampaignStats(campaign);
      await campaign.save();
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Get campaign by ID error:", error);
    res.status(500).json({
      message: "Server error while fetching campaign",
    });
  }
};

// Update campaign status only
const updateCampaignStats = async (req, res) => {
  try {
    const { status } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    if (status !== undefined) {
      campaign.status = status;
    }

    if (status === "Draft") {
      campaign.clickedCount = 0;
      campaign.notClickedCount = campaign.totalTargets || 0;
      campaign.recipients = (campaign.recipients || []).map((recipient) => ({
        email: recipient.email,
        token: recipient.token,
        clicked: false,
        clickedAt: null,
      }));
    }

    recalculateCampaignStats(campaign);
    await campaign.save();

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Update campaign stats error:", error);
    res.status(500).json({
      message: "Server error while updating campaign statistics",
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
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

    await campaign.deleteOne();

    res.status(200).json({
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({
      message: "Server error while deleting campaign",
    });
  }
};

// Send campaign email to one or many recipients
const sendCampaignEmail = async (req, res) => {
  try {
    const { recipients } = req.body;

    if (!recipients) {
      return res.status(400).json({
        message: "Please provide at least one recipient email",
      });
    }

    const emailList = recipients
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    const uniqueEmailList = [...new Set(emailList)];

    if (uniqueEmailList.length === 0) {
      return res.status(400).json({
        message: "No valid recipient emails found",
      });
    }

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    campaign.recipients = uniqueEmailList.map((email) => ({
      email,
      token: crypto.randomBytes(24).toString("hex"),
      clicked: false,
      clickedAt: null,
    }));

    campaign.status = "Active";
    recalculateCampaignStats(campaign);
    await campaign.save();

    const sendResults = [];

    for (const recipient of campaign.recipients) {
      const trackingLink = `${backendUrl}/api/campaigns/track-click/${campaign._id}/${recipient.token}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>${campaign.fakeEmailContent}</p>

          <p>
            <a href="${trackingLink}"
               style="display: inline-block; padding: 10px 15px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
              Verify Now
            </a>
          </p>

          <p style="font-size: 12px; color: #666;">
            This email is part of an authorized cybersecurity awareness training campaign.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"AI Phishing Detector" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: campaign.fakeEmailSubject,
        html: htmlContent,
      });

      sendResults.push(recipient.email);
    }

    res.status(200).json({
      message: "Campaign emails sent successfully",
      sentTo: sendResults,
      totalSent: sendResults.length,
      campaign,
    });
  } catch (error) {
    console.error("Send campaign email error:", error);
    res.status(500).json({
      message: "Server error while sending campaign emails",
    });
  }
};

// Track when email link is clicked
const trackCampaignClick = async (req, res) => {
  try {
    const { id, token } = req.params;

    const campaign = await Campaign.findById(id);

    if (campaign) {
      const recipient = campaign.recipients.find((r) => r.token === token);

      if (recipient && !recipient.clicked) {
        recipient.clicked = true;
        recipient.clickedAt = new Date();

        campaign.status = "Active";
        recalculateCampaignStats(campaign);

        await campaign.save();
      }
    }

    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2>Training Link Click Recorded</h2>
          <p>This click was recorded for cybersecurity awareness training.</p>
          <p>You may now close this page.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).send("Error tracking click");
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStats,
  deleteCampaign,
  sendCampaignEmail,
  trackCampaignClick,
};