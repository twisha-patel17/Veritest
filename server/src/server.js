require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Veritest server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});