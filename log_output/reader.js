const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PING_PONG_HOST = process.env.PING_PONG_HOST || "ping-pong-svc";
const PING_PONG_PORT = process.env.PING_PONG_PORT || "80";

const FILE_PATH = path.join(__dirname, "config", "information.txt");
const MESSAGE = process.env.MESSAGE || "no message found";

function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/status") {
    let fileContent = "could not read file";
    try {
      fileContent = fs.readFileSync(FILE_PATH, "utf8").trim();
    } catch (err) {
      fileContent = `Error: ${err.message}`;
    }

    const now = new Date().toISOString();
    const id = generateId();

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

          http
            .get("http://greeter-svc", (greeterRes) => {
              let greeting = "";
              greeterRes.on("data", (chunk) => (greeting += chunk));
              greeterRes.on("end", () => {
                const output = [`file content: ${fileContent}`, `env variable: MESSAGE=${MESSAGE}`, `${now}: ${id}.`, `Ping / Pongs: ${json.count}`, `Greeting: ${greeting}`].join("\n");

                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(output);
              });
            })
            .on("error", (err) => {
              res.writeHead(500);
              res.end("Failed to reach greeter service.");
            });
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
  } else if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("log-output root alive");
  } else if (req.url === "/healthz" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("healthy");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Reader running on port ${PORT}`);
});
