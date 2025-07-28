const express = require("express");
const fs = require("fs");
const path = require("path");
const { downloadImageIfNeeded, getImageBuffer } = require("./image-downloader");

const app = express();
const PORT = process.env.PORT || 3000;

const FALLBACK_IMAGE = path.join(__dirname, "docs/fallback.png");

// serve static frontend
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// serve image (dynamic route)
app.get("/image", async (req, res) => {
  try {
    await downloadImageIfNeeded();
    const buffer = getImageBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (err) {
    console.error("Error serving image:", err.message);
    if (fs.existsSync(FALLBACK_IMAGE)) {
      const fallback = fs.readFileSync(FALLBACK_IMAGE);
      res.setHeader("Content-Type", "image/png");
      res.send(fallback);
    } else {
      res.status(404).send("No image available.");
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.get("/ready", (req, res) => {
  res.status(200).send("Ready");
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
