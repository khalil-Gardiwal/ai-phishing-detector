const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();


const testRoutes = require("./routes/testRoutes");
const phishingRoutes = require("./routes/phishingRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("AI Phishing Detection Backend is running");
});

app.use("/api", testRoutes);
app.use("/api/phishing", phishingRoutes);


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});