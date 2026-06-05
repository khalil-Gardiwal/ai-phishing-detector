import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("email");
  const [emailText, setEmailText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalScans: 0,
    emailScans: 0,
    urlScans: 0,
    suspiciousResults: 0,
  });

  const updateStats = (type, data) => {
    setStats((prev) => ({
      totalScans: prev.totalScans + 1,
      emailScans: type === "email" ? prev.emailScans + 1 : prev.emailScans,
      urlScans: type === "url" ? prev.urlScans + 1 : prev.urlScans,
      suspiciousResults:
        data.status !== "Safe"
          ? prev.suspiciousResults + 1
          : prev.suspiciousResults,
    }));
  };

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
        { emailText }
      );

      setResult(response.data);
      updateStats("email", response.data);
    } catch (error) {
      alert("Error analyzing email. Make sure backend is running.");
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
        { url }
      );

      setResult(response.data);
      updateStats("url", response.data);
    } catch (error) {
      alert("Error analyzing URL. Make sure backend is running.");
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
            <h3>{stats.totalScans}</h3>
            <p>Total Scans</p>
          </div>

          <div className="stat-card">
            <h3>{stats.emailScans}</h3>
            <p>Email Scans</p>
          </div>

          <div className="stat-card">
            <h3>{stats.urlScans}</h3>
            <p>URL Scans</p>
          </div>

          <div className="stat-card danger">
            <h3>{stats.suspiciousResults}</h3>
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

        {activeTab === "email" && (
          <div className="section">
            <h2>Email Analysis</h2>

            <textarea
              placeholder="Paste suspicious email text here..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            ></textarea>

            <button className="analyze-btn" onClick={analyzeEmail}>
              {loading ? "Analyzing..." : "Analyze Email"}
            </button>
          </div>
        )}

        {activeTab === "url" && (
          <div className="section">
            <h2>URL Analysis</h2>

            <input
              type="text"
              placeholder="Paste suspicious URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button className="analyze-btn" onClick={analyzeUrl}>
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
      </div>
    </div>
  );
}

export default App;