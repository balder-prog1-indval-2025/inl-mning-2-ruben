import express from "express";
import Database from "better-sqlite3";

const db = new Database("mjusik.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        data        TEXT NOT NULL,
        updated_at  INTEGER NOT NULL
    )
`);

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(express.static("./frontend/"));

app.post("/api/projects", (req, res) => {
  const { id, name, data } = req.body;
  const json = JSON.stringify(data);
  const now = Date.now();

  if (id) {
    db.prepare(
      "UPDATE projects SET name=?, data=?, updated_at=? WHERE id=?"
    ).run(name, json, now, id);
    res.json({ id });
  } else {
    const info = db
      .prepare("INSERT INTO projects (name, data, updated_at) VALUES (?, ?, ?)")
      .run(name, json, now);
    res.json({ id: info.lastInsertRowid });
  }
});

app.get("/api/projects", (req, res) => {
  res.json(
    db
      .prepare(
        "SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC"
      )
      .all()
  );
});

app.listen(3000);
