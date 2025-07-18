const crypto = require("crypto");

// random string
const randomString = crypto.randomBytes(16).toString("hex");

// logger, with timestamp
function logWithTimestamp() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]: ${randomString}`);
}

// interval
console.log("Outputting string every 5sec...");
logWithTimestamp();
setInterval(logWithTimestamp, 5000);
