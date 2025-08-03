const http = require("http");

const version = process.env.VERSION || "v1";
const message = `Hello from Greeter ${version}`;

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(message);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(8080, () => {
  console.log(`Greeter ${version} listening on port 8080`);
});
