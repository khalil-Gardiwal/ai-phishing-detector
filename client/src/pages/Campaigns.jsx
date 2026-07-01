import { useEffect, useState } from "react";
import axios from "axios";

function Campaigns() {
  const token = localStorage.getItem("token");

  const [campaignName, setCampaignName] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [fakeEmailSubject, setFakeEmailSubject] = useState("");
  const [fakeEmailContent, setFakeEmailContent] = useState("");
  const [totalTargets, setTotalTargets] = useState("");

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const API_URL = "http://localhost:5000/api/campaigns";

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCampaigns(response.data);
    } catch (error) {
      console.log("Fetch campaigns failed:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async (e) => {
    e.preventDefault();

    if (
      !campaignName.trim() ||
      !targetGroup.trim() ||
      !fakeEmailSubject.trim() ||
      !fakeEmailContent.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        API_URL,
        {
          campaignName,
          targetGroup,
          fakeEmailSubject,
          fakeEmailContent,
          totalTargets: Number(totalTargets) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCampaignName("");
      setTargetGroup("");
      setFakeEmailSubject("");
      setFakeEmailContent("");
      setTotalTargets("");

      await fetchCampaigns();
      alert("Campaign created successfully.");
    } catch (error) {
      console.log("Create campaign failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this campaign?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(campaignId);

      await axios.delete(`${API_URL}/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCampaigns();
      alert("Campaign deleted successfully.");
    } catch (error) {
      console.log("Delete campaign failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to delete campaign");
    } finally {
      setDeletingId(null);
    }
  };

  const markCompleted = async (campaignId) => {
    try {
      setUpdatingId(campaignId);

      await axios.put(
        `${API_URL}/${campaignId}`,
        { status: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCampaigns();
    } catch (error) {
      console.log("Mark completed failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update campaign");
    } finally {
      setUpdatingId(null);
    }
  };

  const resetCampaign = async (campaign) => {
    const confirmReset = window.confirm("Reset this campaign statistics?");

    if (!confirmReset) return;

    try {
      setUpdatingId(campaign._id);

      await axios.put(
        `${API_URL}/${campaign._id}`,
        { status: "Draft" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCampaigns();
    } catch (error) {
      console.log("Reset failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to reset campaign");
    } finally {
      setUpdatingId(null);
    }
  };

  const sendCampaignEmail = async (campaignId) => {
    if (!recipientEmail.trim()) {
      alert("Please enter at least one recipient email.");
      return;
    }

    try {
      setSendingEmailId(campaignId);

      const response = await axios.post(
        `${API_URL}/${campaignId}/send-email`,
        { recipients: recipientEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`${response.data.totalSent} campaign email(s) sent successfully.`);

      setRecipientEmail("");
      await fetchCampaigns();
    } catch (error) {
      console.log("Send campaign email failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to send campaign email");
    } finally {
      setSendingEmailId(null);
    }
  };

  const calculateAwarenessScore = (campaign) => {
    if (!campaign.totalTargets || campaign.totalTargets === 0) return 0;

    const notClicked = Number(campaign.notClickedCount || 0);
    return Math.round((notClicked / campaign.totalTargets) * 100);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const totalCampaigns = campaigns.length;

  const analyticsTotalTargets = campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.totalTargets || 0),
    0
  );

  const totalClicked = campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.clickedCount || 0),
    0
  );

  const totalNotClicked = campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.notClickedCount || 0),
    0
  );

  const clickRate =
    analyticsTotalTargets > 0
      ? Math.round((totalClicked / analyticsTotalTargets) * 100)
      : 0;

  const overallAwarenessScore =
    analyticsTotalTargets > 0
      ? Math.round((totalNotClicked / analyticsTotalTargets) * 100)
      : 0;

  return (
    <div className="page">
      <div className="container">
        <h1>Awareness Campaigns</h1>
        <p className="subtitle">
          Create simulated phishing campaigns for cybersecurity awareness
          training.
        </p>

        <div className="campaign-analytics">
          <h2>Campaign Analytics Dashboard</h2>

          <div className="campaign-stats">
            <div>
              <strong>{totalCampaigns}</strong>
              <small>Total Campaigns</small>
            </div>

            <div>
              <strong>{analyticsTotalTargets}</strong>
              <small>Total Targets</small>
            </div>

            <div>
              <strong>{totalClicked}</strong>
              <small>Total Clicked</small>
            </div>

            <div>
              <strong>{totalNotClicked}</strong>
              <small>Total Not Clicked</small>
            </div>
          </div>

          <div className="analytics-rates">
            <div>
              <strong>Click Rate</strong>
              <p>{clickRate}%</p>
              <progress value={clickRate} max="100"></progress>
            </div>

            <div>
              <strong>Overall Awareness Score</strong>
              <p>{overallAwarenessScore}%</p>
              <progress value={overallAwarenessScore} max="100"></progress>
            </div>
          </div>
        </div>

        <div className="campaign-layout">
          <form className="campaign-form" onSubmit={createCampaign}>
            <h2>Create New Campaign</h2>

            <label>Campaign Name *</label>
            <input
              type="text"
              placeholder="Example: Bank Security Awareness"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />

            <label>Target Group *</label>
            <input
              type="text"
              placeholder="Example: Finance Department"
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
            />

            <label>Total Targets</label>
            <input
              type="number"
              placeholder="Example: 20"
              value={totalTargets}
              onChange={(e) => setTotalTargets(e.target.value)}
            />

            <label>Fake Email Subject *</label>
            <input
              type="text"
              placeholder="Example: Your account has been locked"
              value={fakeEmailSubject}
              onChange={(e) => setFakeEmailSubject(e.target.value)}
            />

            <label>Fake Email Content *</label>
            <textarea
              placeholder="Write the simulated phishing email content here..."
              value={fakeEmailContent}
              onChange={(e) => setFakeEmailContent(e.target.value)}
            />

            <button className="analyze-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </form>

          <div className="campaign-list">
            <h2>Your Campaigns</h2>

            {campaigns.length === 0 ? (
              <p>No campaigns created yet.</p>
            ) : (
              campaigns.map((campaign) => (
                <div className="campaign-card" key={campaign._id}>
                  <div className="campaign-header">
                    <h3>{campaign.campaignName}</h3>
                    <span>{campaign.status}</span>
                  </div>

                  <p>
                    <strong>Target Group:</strong> {campaign.targetGroup}
                  </p>

                  <p>
                    <strong>Total Targets:</strong> {campaign.totalTargets}
                  </p>

                  <p>
                    <strong>Email Subject:</strong> {campaign.fakeEmailSubject}
                  </p>

                  <div className="campaign-stats">
                    <div>
                      <strong>{campaign.clickedCount}</strong>
                      <small>Clicked</small>
                    </div>

                    <div>
                      <strong>{campaign.notClickedCount}</strong>
                      <small>Not Clicked</small>
                    </div>
                  </div>

                  <div className="awareness-score">
                    <strong>
                      Awareness Score: {calculateAwarenessScore(campaign)}%
                    </strong>
                  </div>

                  <button
                    className="view-email-btn"
                    type="button"
                    onClick={() =>
                      setExpandedCampaignId(
                        expandedCampaignId === campaign._id
                          ? null
                          : campaign._id
                      )
                    }
                  >
                    {expandedCampaignId === campaign._id
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  {expandedCampaignId === campaign._id && (
                    <div className="fake-email-preview">
                      <h4>Fake Email Preview</h4>

                      <p>
                        <strong>Subject:</strong> {campaign.fakeEmailSubject}
                      </p>

                      <div className="fake-email-content">
                        {campaign.fakeEmailContent}
                      </div>

                      <h4>Employee Click Tracking</h4>

                      {!campaign.recipients ||
                      campaign.recipients.length === 0 ? (
                        <p>No emails sent yet.</p>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table className="recipient-table">
                            <thead>
                              <tr>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Clicked At</th>
                              </tr>
                            </thead>

                            <tbody>
                              {campaign.recipients.map((recipient) => (
                                <tr key={recipient.token}>
                                  <td>{recipient.email}</td>
                                  <td>
                                    {recipient.clicked
                                      ? "Clicked"
                                      : "Not Clicked"}
                                  </td>
                                  <td>{formatDate(recipient.clickedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="campaign-actions">
                    <button
                      type="button"
                      onClick={() => markCompleted(campaign._id)}
                      disabled={updatingId === campaign._id}
                    >
                      Mark Completed
                    </button>

                    <button
                      type="button"
                      className="reset-btn"
                      onClick={() => resetCampaign(campaign)}
                      disabled={updatingId === campaign._id}
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      className="reset-btn"
                      onClick={() => deleteCampaign(campaign._id)}
                      disabled={deletingId === campaign._id}
                    >
                      {deletingId === campaign._id
                        ? "Deleting..."
                        : "Delete Campaign"}
                    </button>
                  </div>

                  <div className="send-email-box">
                    <h4>Send Training Email</h4>

                    <input
                      type="text"
                      placeholder="email1@gmail.com, email2@gmail.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />

                    <button
                      className="send-email-btn"
                      type="button"
                      onClick={() => sendCampaignEmail(campaign._id)}
                      disabled={sendingEmailId === campaign._id}
                    >
                      {sendingEmailId === campaign._id
                        ? "Sending..."
                        : "Send Campaign Email"}
                    </button>
                  </div>

                  <p className="campaign-note">
                    This is an authorized training campaign. Only send emails to
                    people who agreed to participate.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Campaigns;