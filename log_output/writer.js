const fs = require("fs");
const crypto = require("crypto");

const randomString = crypto.randomBytes(16).toString("hex");
const LOG_FILE = process.env.LOG_FILE || "/shared/log.txt";

console.log("Writer starting...");

function logToFile() {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}]: ${randomString}\n`;
  fs.appendFileSync(LOG_FILE, line, "utf8");
  console.log("Wrote:", line.trim());
}

logToFile();
setInterval(logToFile, 5000);
