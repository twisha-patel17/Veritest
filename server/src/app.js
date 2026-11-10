
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const errorMiddleware = require("./middleware/error.middleware");
const testcaseRoutes = require("./routes/testcase.routes");
const testrunRoutes = require("./routes/testrun.routes");
const executionRoutes = require("./routes/execution.routes");
const sourceFileRoutes = require("./routes/sourcefile.routes");
const aiTestCaseRoutes = require("./routes/ai-testcase.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "200kb" }));
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
app.use("/api/projects", projectRoutes);
app.use("/api", testcaseRoutes);
app.use("/api", testrunRoutes);
app.use("/api", executionRoutes);
app.use("/api", aiTestCaseRoutes);
app.use("/api/projects/:projectId/files", sourceFileRoutes);

app.use(errorMiddleware);

module.exports = app;
