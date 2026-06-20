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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: campaign.fakeEmailSubject,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>${campaign.fakeEmailSubject}</h2>

          <p>${campaign.fakeEmailContent}</p>

          <hr />

          <p style="color:gray;">
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

module.exports = {
  sendCampaignEmail,
};