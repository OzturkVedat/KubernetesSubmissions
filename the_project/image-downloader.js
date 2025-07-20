const fs = require("fs");
const path = require("path");
const https = require("https");

const IMAGE_URL = "https://picsum.photos/1200";
const IMAGE_PATH = process.env.IMAGE_PATH || "/data/image.jpg";
const TIMESTAMP_PATH = process.env.TIMESTAMP_PATH || "/data/last_fetched.txt";
const CACHE_DURATION_MS = 10 * 60 * 1000;

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

function followRedirectAndSave(location, callback) {
  https
    .get(location, (res) => {
      const file = fs.createWriteStream(IMAGE_PATH);
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          fs.writeFileSync(TIMESTAMP_PATH, Date.now().toString());
          console.log("Image downloaded.");
          callback();
        });
      });
    })
    .on("error", (err) => {
      console.error("Redirect error:", err.message);
      callback();
    });
}

function downloadImage(callback) {
  https
    .get(IMAGE_URL, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        followRedirectAndSave(res.headers.location, callback);
      } else if (res.statusCode === 200) {
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
        console.error("Unexpected status code:", res.statusCode);
        callback();
      }
    })
    .on("error", (err) => {
      console.error("Image download error:", err.message);
      callback();
    });
}

function downloadImageIfNeeded() {
  return new Promise((resolve) => {
    if (!fs.existsSync(IMAGE_PATH) || shouldDownloadNewImage()) {
      downloadImage(resolve);
    } else {
      resolve();
    }
  });
}

function getImageBuffer() {
  return fs.readFileSync(IMAGE_PATH);
}

module.exports = {
  downloadImageIfNeeded,
  getImageBuffer,
};
