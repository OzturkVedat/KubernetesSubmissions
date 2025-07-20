const fs = require("fs");
const http = require("http");
const LOG_FILE = process.env.LOG_FILE || "/shared/log.txt";
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/status") {
    let output = "";
    try {
      if (fs.existsSync(LOG_FILE)) {
        const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n");

        const writerLine =
          lines.reverse().find(
            (line) => line.includes(":") && line.includes("-") // crude UUID check
          ) || "[N/A]: [no writer found]";

        const pingCount = lines.filter((line) => line.includes("Ping request number")).length;

        output = `${writerLine}\nPing / Pongs: ${pingCount}`;
      } else {
        output = "Log file has not been created yet.";
      }
    } catch (err) {
      output = "Error reading log file.";
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(output);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Reader running on port ${PORT}`);
});
