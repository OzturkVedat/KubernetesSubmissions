const fs = require("fs");
const https = require("https");

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000;
}

function fetchAndSave() {
  https.get("https://en.wikipedia.org/wiki/Special:Random", (res) => {
    const redirectedUrl = res.headers.location;

    if (redirectedUrl) {
      https.get(redirectedUrl, (pageRes) => {
        let data = "";
        pageRes.on("data", (chunk) => (data += chunk));
        pageRes.on("end", () => {
          const title = redirectedUrl.split("/").pop();
          fs.writeFileSync(`/usr/share/nginx/html/${title}.html`, data);
          console.log(`Saved ${title}.html`);
        });
      });
    }
  });
}

function start() {
  const delay = randomDelay(5, 15);
  console.log(`Waiting for ${delay / 60000} minutes...`);
  setTimeout(fetchAndSave, delay);
}

start();
