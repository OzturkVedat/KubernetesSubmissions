const https = require("https");
const http = require("http");

const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 5000;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function getRandomWikipediaUrl(retries = MAX_RETRIES) {
  while (retries > 0) {
    try {
      return await new Promise((resolve, reject) => {
        https
          .get("https://en.wikipedia.org/wiki/Special:Random", (res) => {
            const location = res.headers.location;
            if (location) {
              resolve("https://en.wikipedia.org" + location);
            } else {
              reject("No redirect location found");
            }
          })
          .on("error", reject);
      });
    } catch (err) {
      console.log(`Retrying Wikipedia request... attempts left: ${retries - 1}`);
      retries--;
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw new Error("Failed to get random Wikipedia article");
}

async function sendTodo(url, retries = MAX_RETRIES) {
  const todoText = `Read ${url}`;
  const payload = JSON.stringify({ text: todoText });

  while (retries > 0) {
    try {
      return await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: "todo-backend-svc.project.svc.cluster.local",
            port: 80,
            path: "/api/todos",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            },
          },
          (res) => {
            if (res.statusCode === 201) {
              console.log(`Todo created: ${todoText}`);
              res.resume();
              resolve();
            } else {
              reject(`Unexpected status code: ${res.statusCode}`);
            }
          }
        );

        req.on("error", reject);
        req.write(payload);
        req.end();
      });
    } catch (err) {
      console.log(`Retrying todo POST... attempts left: ${retries - 1}`);
      retries--;
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error("Failed to POST todo to backend");
}

(async () => {
  try {
    const url = await getRandomWikipediaUrl();
    await sendTodo(url);
  } catch (err) {
    console.error("CronJob failed:", err);
    process.exit(1);
  }
})();
