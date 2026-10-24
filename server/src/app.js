
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Veritest API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Veritest API",
    status: "healthy",
  });
});

module.exports = app;
