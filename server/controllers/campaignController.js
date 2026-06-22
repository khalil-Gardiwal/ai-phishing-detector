const Campaign = require("../models/Campaign");
const transporter = require("../config/emailTransporter");

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

    if (openedCount !== undefined) campaign.openedCount = Number(openedCount);
    if (clickedCount !== undefined) campaign.clickedCount = Number(clickedCount);
    if (ignoredCount !== undefined) campaign.ignoredCount = Number(ignoredCount);
    if (status !== undefined) campaign.status = status;

    await campaign.save();

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Update campaign stats error:", error);
    res.status(500).json({
      message: "Server error while updating campaign statistics",
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
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
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

    const trackingLink = `${backendUrl}/api/campaigns/track-click/${campaign._id}`;
    const openTrackingPixel = `${backendUrl}/api/campaigns/track-open/${campaign._id}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>${campaign.fakeEmailContent}</p>

        <p>
          <a href="${trackingLink}" 
             style="display: inline-block; padding: 10px 15px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            Verify Now
          </a>
        </p>

      <img 
  src="${openTrackingPixel}" 
  width="1" 
  height="1" 
  style="width:1px;height:1px;opacity:0.01;" 
  alt="."
/>

        <p style="font-size: 12px; color: #666;">
          This email is part of an authorized cybersecurity awareness training campaign.
        </p>
      </div>
    `;

    const sendResults = [];

    for (const email of emailList) {
      await transporter.sendMail({
        from: `"AI Phishing Detector" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: campaign.fakeEmailSubject,
        html: htmlContent,
      });

      sendResults.push(email);
    }

    campaign.totalTargets = emailList.length;
    campaign.openedCount = 0;
    campaign.clickedCount = 0;
    campaign.ignoredCount = emailList.length;
    campaign.status = "Active";

    await campaign.save();

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

// Track when email is opened
const trackCampaignOpen = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (campaign) {
      const alreadyTrackedTotal =
        Number(campaign.openedCount) + Number(campaign.clickedCount);

      if (alreadyTrackedTotal < Number(campaign.totalTargets)) {
        campaign.openedCount += 1;

        if (campaign.ignoredCount > 0) {
          campaign.ignoredCount -= 1;
        }

        campaign.status = "Active";
        await campaign.save();
      }
    }

    const pixel = Buffer.from(
      "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64"
    );

    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": pixel.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    res.end(pixel);
  } catch (error) {
    console.error("Track open error:", error);
    res.status(200).end();
  }
};

// Track when email link is clicked
const trackCampaignClick = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (campaign) {
      if (campaign.openedCount > 0) {
        campaign.openedCount -= 1;
        campaign.clickedCount += 1;
      } else if (campaign.ignoredCount > 0) {
        campaign.ignoredCount -= 1;
        campaign.clickedCount += 1;
      } else {
        campaign.clickedCount += 1;
      }

      campaign.status = "Active";
      await campaign.save();
    }

    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h2>Training Link Click Recorded</h2>
          <p>This click was recorded for cybersecurity awareness training.</p>
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
  sendCampaignEmail,
  trackCampaignOpen,
  trackCampaignClick,
};