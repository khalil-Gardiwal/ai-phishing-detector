const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const phishingRoutes = require("./routes/phishingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const campaignRoutes = require("./routes/campaignRoutes");

const app = express();

console.log(
  "Groq Key Loaded:",
  process.env.GROQ_API_KEY
    ? process.env.GROQ_API_KEY.substring(0, 8) + "..."
    : "UNDEFINED"
);

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", testRoutes);
app.use("/api/phishing", phishingRoutes);
app.use("/api/campaigns", campaignRoutes);

app.get("/", (req, res) => {
  res.send("AI Phishing Detection Backend is running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});