const fs = require("fs");
const http = require("http");
const LOG_FILE = process.env.LOG_FILE || "/shared/log.txt";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/status") {
    let content = "";
    try {
      if (fs.existsSync(LOG_FILE)) {
        content = fs.readFileSync(LOG_FILE, "utf8");
      } else {
        content = "Log file has not been created yet.";
      }
    } catch (err) {
      content = "Log file not found or unreadable.";
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Reader running on port ${PORT}`);
});
