const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));

app.use(cors());

const PORT = 3000;

["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
});

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 20;

async function waitForPostgres(retries = MAX_RETRIES) {
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("Postgres is ready.");
      return;
    } catch (err) {
      console.log(`Waiting for Postgres... Retries left: ${retries - 1}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      retries--;
    }
  }
  throw new Error("Could not connect to Postgres after retries.");
}

async function init() {
  try {
    await waitForPostgres();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text VARCHAR(140) NOT NULL
      );
    `);
    console.log("Table 'todos' ensured");

    startServer();
  } catch (err) {
    console.error("Initialization failed:", err);
    process.exit(1);
  }
}

function startServer() {
  app.use(express.json());

  app.get("/api/", (req, res) => {
    res.status(200).send("OK");
  });

  app.get("/api/todos", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM todos");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).send("healthy");
    } catch {
      res.status(500).send("unhealthy");
    }
  });

  app.post("/api/todos", async (req, res) => {
    const { text } = req.body;
    if (!text || text.length > 140) {
      console.warn(`[REJECTED] Todo too long (${text.length} chars): "${text}"`);
      return res.status(400).json({ error: "Todo must be 140 characters or less" });
    }

    try {
      await pool.query("INSERT INTO todos (text) VALUES ($1)", [text]);
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.use((req, res, next) => {
    console.log(`→ Unmatched request: ${req.method} ${req.url}`);
    res.status(404).send("Not found");
  });

  app.listen(PORT, () => {
    console.log(`Todo API running at PORT ${PORT}`);
  });
}

init();
