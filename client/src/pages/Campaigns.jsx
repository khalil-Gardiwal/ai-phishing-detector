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