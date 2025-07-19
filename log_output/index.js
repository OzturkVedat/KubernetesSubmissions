const crypto = require("crypto");
const http = require("http");

const randomString = crypto.randomBytes(16).toString("hex");
let latestTimestamp = new Date().toISOString();

// logger, with timestamp
function logWithTimestamp() {
  latestTimestamp = new Date().toISOString();
  console.log(`[${latestTimestamp}]: ${randomString}`);
}

// interval
console.log("Outputting string every 5sec...");
logWithTimestamp();
setInterval(logWithTimestamp, 5000);

// http server
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        timestamp: latestTimestamp,
        randomString,
      })
    );
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
