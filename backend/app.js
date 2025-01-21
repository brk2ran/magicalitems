


// 1. Abhängigkeiten laden
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const { Pool } = require("pg");

// 2. Initialisiere App und lade Umgebungsvariablen
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// CORS-Konfiguration
const corsOptions = {
  origin: "https://magicalitems.netlify.app", // Erlaube nur deine Frontend-Domain
  methods: "GET,POST,PUT,DELETE", // Erlaube spezifische HTTP-Methoden
  credentials: true, // Für Authentifizierung und Cookies, falls benötigt
};

// 3. Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Bereitstellen statischer Dateien
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. PostgreSQL-Pool einrichten (mit SSL für Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Für Neon erforderlich
  },
});

// 5. Test der Datenbankverbindung
pool.connect((err) => {
  if (err) {
    console.error("Datenbankverbindung fehlgeschlagen:", err.message);
  } else {
    console.log("Erfolgreich mit der Datenbank verbunden.");
  }
});

// 6. Multer-Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Speichere Bilder im Ordner 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 7. Validierungsfunktionen

// Validierung für Items
function validateItem(req, res, next) {
  const { name, price, mana, description, category_id } = req.body;

  if (!name || !price || !mana || !description || !category_id) {
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
  if (typeof description !== "string" || description.trim().length === 0) {
    return res.status(400).json({ error: "Beschreibung darf nicht leer sein" });
  }
  if (typeof category_id !== "number" || category_id <= 0) {
    return res.status(400).json({ error: "Category ID muss eine gültige Zahl sein" });
  }

  next();
}

// 8. Routen

// Testroute
app.get("/", (req, res) => {
  res.send("Backend läuft!");
});

// 8.1 Alle Items abrufen
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.2 Ein neues Item erstellen (mit Bild-Upload)
app.post("/items", upload.single("image"), validateItem, async (req, res) => {
  const { name, price, mana, description, category_id } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

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

// 8.3 Ein Item abrufen
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

// 8.4 Ein Item aktualisieren
app.put("/items/:id", upload.single("image"), validateItem, async (req, res) => {
  const { id } = req.params;
  const { name, price, mana, description, category_id } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      "UPDATE items SET name = $1, price = $2, mana = $3, image = COALESCE($4, image), description = $5, category_id = $6 WHERE id = $7 RETURNING *",
      [name, price, mana, image, description, category_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item nicht gefunden" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.5 Ein Item löschen
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

// 8.6 Alle Kategorien abrufen
app.get("/categories", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM categories");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // 8.7 Eine neue Kategorie erstellen
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
  
  // 8.8 Eine Kategorie aktualisieren
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
  
  // 8.9 Eine Kategorie löschen
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

  // 8.10 Items einer Kategorie abrufen
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
  
  

// 9. Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
