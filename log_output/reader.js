const http = require("http");

const PORT = process.env.PORT || 3000;
const PING_PONG_HOST = process.env.PING_PONG_HOST || "ping-pong-svc";
const PING_PONG_PORT = process.env.PING_PONG_PORT || "1235";

const server = http.createServer((req, res) => {
  if (req.url === "/status") {
    const options = {
      hostname: PING_PONG_HOST,
      port: PING_PONG_PORT,
      path: "/ping",
      method: "GET",
    };

    const request = http.request(options, (pongRes) => {
      let data = "";
      pongRes.on("data", (chunk) => (data += chunk));
      pongRes.on("end", () => {
        try {
          const json = JSON.parse(data);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(`Ping / Pongs: ${json.count}`);
        } catch (err) {
          res.writeHead(500);
          res.end("Invalid response from pingpong app");
        }
      });
    });

    request.on("error", (err) => {
      res.writeHead(500);
      res.end("Failed to reach pingpong app");
    });

    request.end();
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Reader running on port ${PORT}`);
});
