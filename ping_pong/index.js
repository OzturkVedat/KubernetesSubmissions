const http = require("http");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const RETRY_INTERVAL_MS = 5000;
const MAX_RETRIES = 20;

async function waitForPostgres(retries = MAX_RETRIES) {
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("Connected to postgres.");
      return;
    } catch (err) {
      console.log(`Waiting for postgres.. Retries left: ${retries - 1}`);
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
      retries--;
    }
  }

  throw new Error("Could not connect to postgres after retries");
}

async function init() {
  try {
    await waitForPostgres();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pings (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'pings' ensured");

    startServer();
  } catch (err) {
    console.error("Initialization failed:", err);
    process.exit(1);
  }
}

function startServer() {
  const PORT = process.env.PORT || 3000;

  const server = http.createServer(async (req, res) => {
    if (req.url === "/pingpong" && req.method === "GET") {
      try {
        await pool.query("INSERT INTO pings DEFAULT VALUES");
        const result = await pool.query("SELECT COUNT(*) FROM pings");
        const count = result.rows[0].count;

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`pong ${count}`);
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    } else if (req.url === "/ping" && req.method === "GET") {
      try {
        const result = await pool.query("SELECT COUNT(*) FROM pings");
        const count = result.rows[0].count;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ count }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    } else if (req.url === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Ping-pong app root is alive");
    } else if (req.url === "/healthz" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("healthy");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  });

  server.listen(PORT, () => {
    console.log(`Ping-pong app running on port ${PORT}`);
  });
}

init();
