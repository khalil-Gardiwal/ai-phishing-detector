import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("email");
  const [emailText, setEmailText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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
        { emailText },
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
      console.log("Email analyze failed:", error.response?.data || error);
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
        { url },
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
      console.log("URL analyze failed:", error.response?.data || error);
      alert(error.response?.data?.message || "Error analyzing URL");
    } finally {
      setLoading(false);
    }
  };

  const getType = (item) => item.type?.toLowerCase();
  const getStatus = (item) => item.status?.toLowerCase();

  const totalScans = history.length;
  const emailScans = history.filter((item) => getType(item) === "email").length;
  const urlScans = history.filter((item) => getType(item) === "url").length;
  const safeScans = history.filter((item) => getStatus(item) === "safe").length;

  const suspiciousScans = history.filter(
    (item) => getStatus(item) === "suspicious"
  ).length;

  const highRiskScans = history.filter(
    (item) =>
      getStatus(item) === "high risk" ||
      getStatus(item) === "high-risk" ||
      getStatus(item) === "highrisk"
  ).length;

  const riskPieData = [
    { name: "Safe", value: safeScans },
    { name: "Suspicious", value: suspiciousScans },
    { name: "High Risk", value: highRiskScans },
  ];

  const scanTypeData = [
    { name: "Email", scans: emailScans },
    { name: "URL", scans: urlScans },
  ];

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AI Phishing Detection Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Total Scans: ${totalScans}`, 14, 35);
    doc.text(`Safe Scans: ${safeScans}`, 14, 43);
    doc.text(`Suspicious Scans: ${suspiciousScans}`, 14, 51);
    doc.text(`High Risk Scans: ${highRiskScans}`, 14, 59);
    doc.text(`Email Scans: ${emailScans}`, 14, 67);
    doc.text(`URL Scans: ${urlScans}`, 14, 75);

    autoTable(doc, {
      startY: 90,
      head: [["Type", "Status", "Risk Score", "Full Content"]],
      body: history.map((item) => [
        item.type,
        item.status,
        `${item.riskScore}%`,
        item.content || "",
      ]),
      styles: {
        fontSize: 9,
        cellWidth: "wrap",
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 110 },
      },
    });

    doc.save("phishing-report.pdf");
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
            <h3>{totalScans}</h3>
            <p>Total Scans</p>
          </div>

          <div className="stat-card safe">
            <h3>{safeScans}</h3>
            <p>Safe Scans</p>
          </div>

          <div className="stat-card warning">
            <h3>{suspiciousScans}</h3>
            <p>Suspicious Scans</p>
          </div>

          <div className="stat-card danger">
            <h3>{highRiskScans}</h3>
            <p>High Risk Scans</p>
          </div>

          <div className="stat-card">
            <h3>{emailScans}</h3>
            <p>Email Scans</p>
          </div>

          <div className="stat-card">
            <h3>{urlScans}</h3>
            <p>URL Scans</p>
          </div>
        </div>

        <button className="export-btn" onClick={exportPDF}>
          Export Report as PDF
        </button>

        <div className="charts-section">
          <div className="chart-card">
            <h2>Risk Level Statistics</h2>

            {totalScans === 0 ? (
              <p>No scan data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h2>Email vs URL Scans</h2>

            {totalScans === 0 ? (
              <p>No scan data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={scanTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            )}
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
              <div
                className="history-item clickable-history"
                key={item._id}
                onClick={() =>
                  setExpandedId(expandedId === item._id ? null : item._id)
                }
              >
                <div className="history-content">
                  <strong>{item.type}</strong> — {item.status}

                  <p>
                    {expandedId === item._id
                      ? item.content
                      : `${item.content.slice(0, 80)}...`}
                  </p>

                  <small>
                    {expandedId === item._id
                      ? "Click to hide full content"
                      : "Click to view full content"}
                  </small>
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