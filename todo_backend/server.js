const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request path:", req.path);
  next();
});

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

async function waitForPostgres(retries = 20) {
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("Postgres is ready.");
      return;
    } catch (err) {
      console.log(`Waiting for Postgres... Retries left: ${retries - 1}`);
      await new Promise((res) => setTimeout(res, 5000));
      retries--;
    }
  }
  throw new Error("Could not connect to Postgres.");
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

    // Routes
    app.get("/api/health", async (req, res) => {
      console.log("[/api/health] entered route handler");
      try {
        await pool.query("SELECT 1");
        res.status(200).send("healthy");
      } catch (err) {
        console.error("[/api/health] DB check failed", err);
        res.status(500).send("unhealthy");
      }
    });

    app.get("/api/", (req, res) => {
      res.status(200).send("OK");
    });

    app.get("/api/todos", async (req, res) => {
      try {
        const result = await pool.query("SELECT * FROM todos");
        console.log(`Fetched ${result.rows.length} todos`);
        res.json(result.rows);
      } catch (err) {
        console.error("Error fetching todos:", err);
        res.status(500).json({ error: "Database error" });
      }
    });

    app.post("/api/todos", async (req, res) => {
      const { text } = req.body;
      if (!text || text.length > 140) return res.status(400).json({ error: "Todo must be 140 characters or less" });

      try {
        await pool.query("INSERT INTO todos (text) VALUES ($1)", [text]);
        console.log(`Added todo: "${text}"`);
        res.status(201).json({ success: true });
      } catch (err) {
        console.error("Error inserting todo:", err);
        res.status(500).json({ error: "Database error" });
      }
    });

    // 404 fallback
    app.use((req, res) => {
      res.status(404).send("Not found");
    });

    app.listen(PORT, () => {
      console.log(`Todo-backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

init();
