const http = require("http");
const app = require("./server");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`MantiQ server running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});
