const fs = require("fs");
const crypto = require("crypto");

const randomString = crypto.randomBytes(16).toString("hex");

console.log("Writer starting...");

function logTo() {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}]: ${randomString}\n`;
  console.log("Wrote:", line.trim());
}

logTo();
setInterval(logTo, 5000);
