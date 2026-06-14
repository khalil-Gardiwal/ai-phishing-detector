import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("email");
  const [emailText, setEmailText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/phishing/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(response.data);
    } catch (error) {
      console.log("History fetch failed", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const analyzeEmail = async () => {
    if (!emailText.trim()) {
      alert("Please paste email text first.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        "http://localhost:5000/api/phishing/analyze-email",
        {
          emailText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
      setEmailText("");
      await fetchHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Error analyzing email");
    } finally {
      setLoading(false);
    }
  };

  const analyzeUrl = async () => {
    if (!url.trim()) {
      alert("Please paste a URL first.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        "http://localhost:5000/api/phishing/analyze-url",
        {
          url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
      setUrl("");
      await fetchHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Error analyzing URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1>AI Phishing Detection System</h1>
        <p className="subtitle">
          Analyze suspicious emails and URLs for phishing indicators.
        </p>

        <div className="dashboard">
          <div className="stat-card">
            <h3>{history.length}</h3>
            <p>Total Scans</p>
          </div>

          <div className="stat-card">
            <h3>{history.filter((item) => item.type === "Email").length}</h3>
            <p>Email Scans</p>
          </div>

          <div className="stat-card">
            <h3>{history.filter((item) => item.type === "URL").length}</h3>
            <p>URL Scans</p>
          </div>

          <div className="stat-card danger">
            <h3>{history.filter((item) => item.status !== "Safe").length}</h3>
            <p>Suspicious Results</p>
          </div>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "email" ? "active" : ""}
            onClick={() => {
              setActiveTab("email");
              setResult(null);
            }}
          >
            Email Analysis
          </button>

          <button
            className={activeTab === "url" ? "active" : ""}
            onClick={() => {
              setActiveTab("url");
              setResult(null);
            }}
          >
            URL Analysis
          </button>
        </div>

        {activeTab === "email" ? (
          <div className="section">
            <h2>Email Analysis</h2>

            <textarea
              placeholder="Paste suspicious email text here..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            />

            <button
              className="analyze-btn"
              onClick={analyzeEmail}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Email"}
            </button>
          </div>
        ) : (
          <div className="section">
            <h2>URL Analysis</h2>

            <input
              type="text"
              placeholder="Paste suspicious URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              className="analyze-btn"
              onClick={analyzeUrl}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze URL"}
            </button>
          </div>
        )}

        {result && (
          <div className="result-card">
            <h2>Analysis Result</h2>

            <p>
              <strong>Status:</strong> {result.status}
            </p>

            <p>
              <strong>Risk Score:</strong> {result.riskScore}%
            </p>

            {result.foundWords && (
              <p>
                <strong>Suspicious Words:</strong>{" "}
                {result.foundWords.length > 0
                  ? result.foundWords.join(", ")
                  : "None"}
              </p>
            )}

            <div>
              <strong>Reasons:</strong>

              {result.reasons && result.reasons.length > 0 ? (
                <ul>
                  {result.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p>No suspicious reasons found.</p>
              )}
            </div>

            <p>
              <strong>Recommendation:</strong> {result.recommendation}
            </p>
          </div>
        )}

        <div className="history-card">
          <h2>Recent Scan History</h2>

          {history.length === 0 ? (
            <p>No scans yet for this user.</p>
          ) : (
            history.slice(0, 5).map((item) => (
              <div className="history-item" key={item._id}>
                <div>
                  <strong>{item.type}</strong> — {item.status}
                  <p>{item.content.slice(0, 80)}...</p>
                </div>

                <span>{item.riskScore}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;