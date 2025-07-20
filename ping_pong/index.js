const http = require("http");
const fs = require("fs");
const path = require("path");

const LOG_FILE = process.env.LOG_FILE || "/shared/log.txt";
const PORT = process.env.PORT || 3000;

let counter = 0;

const server = http.createServer((req, res) => {
  if (req.url === "/pingpong" && req.method === "GET") {
    counter++;

    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] Ping request number: ${counter}\n`;
    try {
      fs.appendFileSync(LOG_FILE, logLine, "utf8");
    } catch (err) {
      console.error("Failed to write to log file:", err);
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`pong ${counter}`);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Ping-pong app running on port ${PORT}`);
});
