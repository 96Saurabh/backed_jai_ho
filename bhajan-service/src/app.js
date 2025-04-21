const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/database.config");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use("/api/bhajan", require("./routes/bhajan.routes"));

app.get("/", (req, res) => res.send("🚀 Bhajan Service is Running..."));

module.exports = app;
