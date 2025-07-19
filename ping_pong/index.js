const http = require("http");

const PORT = process.env.PORT || 3000;
let counter = 0;

const server = http.createServer((req, res) => {
  if (req.url === "/pingpong" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`pong ${counter++}`);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Ping-pong app running on port ${PORT}`);
});
