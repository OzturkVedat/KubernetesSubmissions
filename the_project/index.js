const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
      <html>
        <head><title>Welcome</title></head>
        <body>
          <h1>Welcome to the Todo App</h1>
          <p>This is a response from the / route.</p>
        </body>
      </html>`);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
