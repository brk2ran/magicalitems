// 1. Abhängigkeiten laden
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

// 2. Initialisiere App und lade Umgebungsvariablen
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware
app.use(cors());
app.use(bodyParser.json()); // Verarbeitet JSON-Daten
app.use(bodyParser.urlencoded({ extended: true })); // Verarbeitet Formulardaten

// 4. PostgreSQL-Pool einrichten
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 5. Test der Datenbankverbindung
pool.connect((err) => {
  if (err) {
    console.error("Datenbankverbindung fehlgeschlagen:", err);
  } else {
    console.log("Mit der Datenbank verbunden.");
  }
});

// 6. Validierungsfunktionen

// Validierung für Items
function validateItem(req, res, next) {
    const { name, price, mana, image, description, category_id } = req.body;
  
    if (!name || !price || !mana || !image || !description || !category_id) {
      return res.status(400).json({ error: "Alle Felder sind erforderlich" });
    }
  
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name muss ein gültiger String sein" });
    }
    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Preis muss eine positive Zahl sein" });
    }
    if (typeof mana !== "number" || mana < 0) {
      return res.status(400).json({ error: "Mana muss eine positive Ganzzahl sein" });
    }
    if (typeof image !== "string" || !image.startsWith("http")) {
      return res.status(400).json({ error: "Image muss eine gültige URL sein" });
    }
    if (typeof description !== "string" || description.trim().length === 0) {
      return res.status(400).json({ error: "Beschreibung darf nicht leer sein" });
    }
    if (typeof category_id !== "number" || category_id <= 0) {
      return res.status(400).json({ error: "Category ID muss eine gültige Zahl sein" });
    }
  
    next();
  }
  
  // Validierung für Kategorien
  function validateCategory(req, res, next) {
    const { name } = req.body;
  
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name der Kategorie ist erforderlich und muss ein gültiger String sein" });
    }
  
    next();
  }

// 7. Routen

// Testroute
app.get("/", (req, res) => {
  res.send("Backend läuft!");
});

// CRUD-Operationen für Items

// 7.1 Alle Items abrufen
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.2 Ein neues Item erstellen
app.post("/items", async (req, res) => {
  const { name, price, mana, image, description,category_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO items (name, price, mana, image, description, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, price, mana, image, description, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.3 Ein Item abrufen
app.get("/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item nicht gefunden" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.4 Ein Item aktualisieren
app.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, mana, image, description, category_id } = req.body;
  try {
    const result = await pool.query(
      "UPDATE items SET name = $1, price = $2, mana = $3, image = $4, description = $5, category_id = $6 WHERE id = $7 RETURNING *",
      [name, price, mana, image, description,category_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item nicht gefunden" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7.5 Ein Item löschen
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item nicht gefunden" });
    }
    res.status(200).json({ message: "Item erfolgreich gelöscht", item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD-Operationen für Kategorien

// 7.6 Alle Kategorien abrufen
app.get("/categories", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM categories");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // 7.7 Eine neue Kategorie erstellen
  app.post("/categories", async (req, res) => {
    const { name } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // 7.8 Eine Kategorie aktualisieren
  app.put("/categories/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const result = await pool.query(
        "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
        [name, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Kategorie nicht gefunden" });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // 7.9 Eine Kategorie löschen
  app.delete("/categories/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "DELETE FROM categories WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Kategorie nicht gefunden" });
      }
      res.status(200).json({ message: "Kategorie gelöscht", category: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7.10 Items einer Kategorie abrufen
  app.get("/categories/:id/items", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "SELECT * FROM items WHERE category_id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Keine Items in dieser Kategorie gefunden" });
      }
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  

// 8. Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
