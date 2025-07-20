const http = require("http");
const fs = require("fs");
const https = require("https");
const path = require("path");

const PORT = process.env.PORT || 3000;
const IMAGE_PATH = process.env.IMAGE_PATH || "/data/image.jpg";
const TIMESTAMP_PATH = process.env.TIMESTAMP_PATH || "/data/last_fetched.txt";
const FALLBACK_IMAGE = path.join(__dirname, "fallback.png"); // fallback on failure
const IMAGE_URL = "https://picsum.photos/1200";
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10min

function getLastFetchTime() {
  if (!fs.existsSync(TIMESTAMP_PATH)) return 0;
  const timeStr = fs.readFileSync(TIMESTAMP_PATH, "utf8");
  return parseInt(timeStr, 10) || 0;
}

function shouldDownloadNewImage() {
  const lastFetch = getLastFetchTime();
  const now = Date.now();
  return now - lastFetch > CACHE_DURATION_MS;
}

function downloadImage(callback) {
  https
    .get(IMAGE_URL, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        https
          .get(res.headers.location, (redirectRes) => {
            const file = fs.createWriteStream(IMAGE_PATH);
            redirectRes.pipe(file);
            file.on("finish", () => {
              file.close(() => {
                fs.writeFileSync(TIMESTAMP_PATH, Date.now().toString());
                console.log("Image downloaded (via redirect).");
                callback();
              });
            });
          })
          .on("error", (err) => {
            console.error("Redirect download error:", err.message);
            callback();
          });
      } else if (res.statusCode === 200) {
        // Direct response (non-redirect)
        const file = fs.createWriteStream(IMAGE_PATH);
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            fs.writeFileSync(TIMESTAMP_PATH, Date.now().toString());
            console.log("Image downloaded (direct).");
            callback();
          });
        });
      } else {
        console.error(`Unexpected status code: ${res.statusCode}`);
        callback();
      }
    })
    .on("error", (err) => {
      console.error("Image download error:", err.message);
      callback();
    });
}

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    if (!fs.existsSync(IMAGE_PATH)) {
      console.log("No cached image found, downloading...");
      return downloadImage(() => {
        res.writeHead(302, { Location: "/image" });
        res.end();
      });
    }

    if (shouldDownloadNewImage()) {
      console.log("Cache expired, prefetching new image...");
      downloadImage(() => console.log("Image updated."));
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Welcome to "the project"</h1>
          <p>This image updates every ~10min:</p>
          <img src="/image" width="600"/>
        </body>
      </html>
    `);
  } else if (req.url === "/image") {
    if (fs.existsSync(IMAGE_PATH)) {
      const img = fs.readFileSync(IMAGE_PATH);
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(img);
    } else if (fs.existsSync(FALLBACK_IMAGE)) {
      const fallback = fs.readFileSync(FALLBACK_IMAGE);
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(fallback);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("No image available.");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
