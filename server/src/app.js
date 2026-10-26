
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Veritest API is running." });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy.",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

module.exports = app;
