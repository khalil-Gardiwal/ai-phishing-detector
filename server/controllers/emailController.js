const transporter = require("../config/emailTransporter");
const Campaign = require("../models/Campaign");

const sendCampaignEmail = async (req, res) => {
  try {
    const { campaignId, recipientEmail } = req.body;

    if (!campaignId || !recipientEmail) {
      return res.status(400).json({
        message: "Campaign ID and recipient email are required",
      });
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      user: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    const trackingLink = `${process.env.BACKEND_URL}/api/email/click/${campaign._id}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: campaign.fakeEmailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>${campaign.fakeEmailSubject}</h2>

          <p>${campaign.fakeEmailContent}</p>

          <p>
            <a href="${trackingLink}" 
               style="background:#2563eb;color:white;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block;">
              Review Account
            </a>
          </p>

          <hr />

          <p style="color:gray;font-size:13px;">
            This is an authorized cybersecurity awareness training email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Campaign email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);

    res.status(500).json({
      message: "Failed to send email",
    });
  }
};

const trackCampaignClick = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    campaign.clickedCount += 1;

    if (campaign.ignoredCount > 0) {
      campaign.ignoredCount -= 1;
    }

    campaign.status = "Active";

    await campaign.save();

    res.send(`
      <html>
        <head>
          <title>Awareness Training</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Cybersecurity Awareness Training</h1>
          <p>This click has been recorded for training purposes.</p>
          <p>You clicked a simulated phishing training link.</p>
          <h3>Training Tip:</h3>
          <p>Always verify links before clicking and never share passwords through email.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Click tracking error:", error);
    res.status(500).send("Error tracking click");
  }
};

module.exports = {
  sendCampaignEmail,
  trackCampaignClick,
};