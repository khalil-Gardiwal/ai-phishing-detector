import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("email");
  const [emailText, setEmailText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    const response = await axios.get("http://localhost:5000/api/phishing/history");
    setHistory(response.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const analyzeEmail = async () => {
    if (!emailText.trim()) return alert("Please paste email text first.");

    setLoading(true);
    const response = await axios.post("http://localhost:5000/api/phishing/analyze-email", {
      emailText,
    });

    setResult(response.data);
    await fetchHistory();
    setLoading(false);
  };

  const analyzeUrl = async () => {
    if (!url.trim()) return alert("Please paste a URL first.");

    setLoading(true);
    const response = await axios.post("http://localhost:5000/api/phishing/analyze-url", {
      url,
    });

    setResult(response.data);
    await fetchHistory();
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        <h1>AI Phishing Detection System</h1>
        <p className="subtitle">Analyze suspicious emails and URLs for phishing indicators.</p>

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
          <button className={activeTab === "email" ? "active" : ""} onClick={() => setActiveTab("email")}>
            Email Analysis
          </button>
          <button className={activeTab === "url" ? "active" : ""} onClick={() => setActiveTab("url")}>
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
            <button className="analyze-btn" onClick={analyzeEmail}>
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
            <button className="analyze-btn" onClick={analyzeUrl}>
              {loading ? "Analyzing..." : "Analyze URL"}
            </button>
          </div>
        )}

        {result && (
          <div className="result-card">
            <h2>Analysis Result</h2>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Risk Score:</strong> {result.riskScore}%</p>

            {result.foundWords && (
              <p>
                <strong>Suspicious Words:</strong>{" "}
                {result.foundWords.length ? result.foundWords.join(", ") : "None"}
              </p>
            )}

            <strong>Reasons:</strong>
            {result.reasons?.length ? (
              <ul>
                {result.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p>No suspicious reasons found.</p>
            )}

            <p><strong>Recommendation:</strong> {result.recommendation}</p>
          </div>
        )}

        <div className="history-card">
          <h2>Recent Scan History</h2>

          {history.length === 0 ? (
            <p>No scans yet.</p>
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

export default App;