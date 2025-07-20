const http = require("http");

let counter = 0;
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/pingpong" && req.method === "GET") {
    counter++;
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`pong ${counter}`);
  } else if (req.url === "/ping" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ count: counter }));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Ping-pong app running on port ${PORT}`);
});
