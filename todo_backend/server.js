const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

let todos = ["Finish Kubernetes homework", "Push Docker image", "Write deployment YAMLs"];

app.use(cors());
app.use(express.json());

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const { text } = req.body;
  if (!text || text.length > 140) {
    return res.status(400).json({ error: "Invalid todo text" });
  }
  todos.push(text);
  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Todo API running at PORT ${PORT}`);
});
