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
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/campaigns", {
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
        "http://localhost:5000/api/campaigns",
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

  const updateCampaignStats = async (campaign, action) => {
    try {
      setUpdatingId(campaign._id);

      let openedCount = campaign.openedCount;
      let clickedCount = campaign.clickedCount;
      let ignoredCount = campaign.ignoredCount;
      let status = campaign.status;

      if (action === "open") {
        if (ignoredCount > 0) {
          ignoredCount -= 1;
          openedCount += 1;
        }
        status = "Active";
      }

      if (action === "click") {
        if (ignoredCount > 0) {
          ignoredCount -= 1;
          clickedCount += 1;
        } else if (openedCount > 0) {
          openedCount -= 1;
          clickedCount += 1;
        }
        status = "Active";
      }

      if (action === "complete") {
        status = "Completed";
      }

      if (action === "reset") {
        openedCount = 0;
        clickedCount = 0;
        ignoredCount = campaign.totalTargets;
        status = "Draft";
      }

      await axios.put(
        `http://localhost:5000/api/campaigns/${campaign._id}`,
        {
          openedCount,
          clickedCount,
          ignoredCount,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCampaigns();
    } catch (error) {
      console.log("Update campaign failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update campaign");
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateAwarenessScore = (campaign) => {
    if (!campaign.totalTargets || campaign.totalTargets === 0) {
      return 0;
    }

    const safeUsers = campaign.ignoredCount + campaign.openedCount;
    const score = Math.round((safeUsers / campaign.totalTargets) * 100);

    return score;
  };

  return (
    <div className="page">
      <div className="container">
        <h1>Awareness Campaigns</h1>
        <p className="subtitle">
          Create simulated phishing campaigns for cybersecurity awareness
          training.
        </p>

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
              placeholder="Example: Your bank account has been locked"
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
                    <strong>Email Subject:</strong>{" "}
                    {campaign.fakeEmailSubject}
                  </p>

                  <div className="campaign-stats">
                    <div>
                      <strong>{campaign.openedCount}</strong>
                      <small>Opened</small>
                    </div>

                    <div>
                      <strong>{campaign.clickedCount}</strong>
                      <small>Clicked</small>
                    </div>

                    <div>
                      <strong>{campaign.ignoredCount}</strong>
                      <small>Ignored</small>
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
                      ? "Hide Fake Email"
                      : "View Fake Email"}
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
                    </div>
                  )}

                  <div className="campaign-actions">
                    <button
                      type="button"
                      onClick={() => updateCampaignStats(campaign, "open")}
                      disabled={updatingId === campaign._id}
                    >
                      Simulate Opened
                    </button>

                    <button
                      type="button"
                      onClick={() => updateCampaignStats(campaign, "click")}
                      disabled={updatingId === campaign._id}
                    >
                      Simulate Clicked
                    </button>

                    <button
                      type="button"
                      onClick={() => updateCampaignStats(campaign, "complete")}
                      disabled={updatingId === campaign._id}
                    >
                      Mark Completed
                    </button>

                    <button
                      type="button"
                      className="reset-btn"
                      onClick={() => updateCampaignStats(campaign, "reset")}
                      disabled={updatingId === campaign._id}
                    >
                      Reset
                    </button>
                  </div>

                  <p className="campaign-note">
                    This is a simulated training campaign. No real phishing
                    emails are sent in this phase.
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