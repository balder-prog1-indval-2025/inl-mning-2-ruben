import express from "express";
import Database from "better-sqlite3";

const db = new Database("mjusik.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL UNIQUE,
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

  try {
    if (id) {
      db.prepare(
        "UPDATE projects SET name=?, data=?, updated_at=? WHERE id=?"
      ).run(name, json, now, id);
      res.json({ id });
    } else {
      const info = db
        .prepare(
          "INSERT INTO projects (name, data, updated_at) VALUES (?, ?, ?)"
        )
        .run(name, json, now);
      res.json({ id: info.lastInsertRowid });
    }
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Name already in use" });
    }
    throw e;
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

app.get("/api/projects/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM projects WHERE id=?")
    .get(req.params.id);
  if (!row) return res.status(404).end();
  res.json({ id: row.id, name: row.name, data: JSON.parse(row.data) });
});

app.get("/api/projects/remove/:id", (req, res) => {
  let id = req.params.id;
  const deleteStatement = db.prepare("DELETE FROM projects WHERE id=?").run(id);
  res.json({ deleteStatement });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
