// 1. Abhängigkeiten laden
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser"); // Optional, falls benötigt
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const fs = require("fs");


// 2. Initialisiere App und lade Umgebungsvariablen
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const uploadPath = path.join("/data", "uploads");

// CORS-Konfiguration
const corsOptions = {
  origin: ['https://magicalitems.netlify.app'], // Erlaube nur deine Frontend-Domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Erlaube spezifische HTTP-Methoden
  credentials: true, // Für Authentifizierung und Cookies, falls benötigt
};

// 3. Middleware
app.use(cors(corsOptions)); // CORS aktivieren
app.use(express.json()); // Wichtig für JSON-Parsing
app.use(bodyParser.urlencoded({ extended: true })); // Optional: Parsing von URL-encoded-Daten


// Bereitstellen statischer Dateien
app.use("/uploads", express.static(path.join('/data', "uploads")));


// **Check:** Falls das Verzeichnis /data/uploads noch nicht existiert, wird es angelegt.
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Ordner "${uploadPath}" wurde angelegt.`);
}

// 4. PostgreSQL-Pool einrichten (mit SSL für Neon)
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false } // SSL für Neon in Produktion
    : false, // Kein SSL für lokale Datenbank
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
    const uploadPath = path.join('/data', 'uploads');
    console.log('Speicherort:', uploadPath);
    cb(null, uploadPath); // Zielordner für hochgeladene Dateien
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    console.log('Dateiname:', uniqueSuffix); // Log für Dateinamen
    cb(null, uniqueSuffix); // Einzigartiger Dateiname
  },
});

const upload = multer({ storage });


// Debug-Logs für Middleware
console.log("Middleware initialized:");
console.log("express.json() enabled");
console.log("Multer storage destination:", path.join(__dirname, "uploads"));

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
  if (isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: "Preis muss eine positive Zahl sein" });
  }
  if (isNaN(mana) || Number(mana) < 0) {
    return res.status(400).json({ error: "Mana muss eine positive Ganzzahl sein" });
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    return res.status(400).json({ error: "Beschreibung darf nicht leer sein" });
  }
  if (isNaN(category_id) || Number(category_id) <= 0) {
    return res.status(400).json({ error: "Category ID muss eine gültige Zahl sein" });
  }

  next();
}


// 8. Routen

// Testroute
app.get("/", (req, res) => {
  res.send("Backend läuft!");
});

/*
// 8.1 Alle Items abrufen
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/

// 8.1 Alle Items abrufen (mit optionaler Filterung nach Kategorie)
app.get("/items", async (req, res) => {
  const { category_id } = req.query;

  try {
    let query = "SELECT * FROM items";
    const values = [];

    if (category_id) {
      query += " WHERE category_id = $1";
      values.push(category_id);
    }

    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fehler in GET /items:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 8.2 Ein neues Item erstellen (mit Bild-Upload)
app.post('/items', upload.single('image'), validateItem, async (req, res) => {
  const { name, price, mana, description, category_id } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.jpg';
  console.log("Bildpfad:", imagePath);
  console.log('Uploaded file:', req.file); // Log hochgeladene Datei

  try {
    const query = `
      INSERT INTO items (name, price, mana, image, description, category_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [name, price, mana, imagePath, description, category_id];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Fehler beim Erstellen eines Items:", err.message);
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
app.put('/items/:id', upload.single('image'), validateItem, async (req, res) => {
  const { id } = req.params;
  const { name, price, mana, description, category_id } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  console.log(`PUT /items/${id} aufgerufen`);
  console.log("Daten für PUT /items:", { name, price, mana, description, category_id, image });

  try {
    const query = `
      UPDATE items SET 
      name = $1, 
      price = $2, 
      mana = $3, 
      image = COALESCE($4, image), 
      description = $5, 
      category_id = $6 
      WHERE id = $7 RETURNING *`;
    const values = [name, price, mana, image, description, category_id, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      console.log(`Item mit ID ${id} nicht gefunden.`);
      return res.status(404).json({ error: "Item nicht gefunden" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(`Fehler beim Aktualisieren des Items mit ID ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});


// 8.5 Ein Item löschen
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /items/${id} aufgerufen`);
  try {
    const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      console.log(`Item mit ID ${id} nicht gefunden.`);
      return res.status(404).json({ error: "Item nicht gefunden" });
    }
    console.log("Item gelöscht:", result.rows[0]);
    res.status(200).json({ message: "Item erfolgreich gelöscht", item: result.rows[0] });
  } catch (err) {
    console.error("Fehler in DELETE /items/${id}:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// CRUD-Operationen für Kategorien

// 8.6 Alle Kategorien abrufen
app.get("/categories", async (req, res) => {
  console.log("GET /categories aufgerufen");
  try {
    const result = await pool.query("SELECT * FROM categories");
    console.log("Datenbankantwort für /categories:", result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fehler in GET /categories:", err.message);
    res.status(500).json({ error: err.message });
  }
});
  
// 8.7 Eine neue Kategorie erstellen
app.post("/categories", async (req, res) => {
  console.log("POST /categories aufgerufen");
  console.log("Daten für POST /categories:", req.body);
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    console.log("Neue Kategorie erstellt:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Fehler in POST /categories:", err.message);
    res.status(500).json({ error: err.message });
  }
});
  
// 8.8 Eine Kategorie aktualisieren
app.put("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  console.log(`PUT /categories/${id} aufgerufen`);
  console.log("Daten für PUT /categories:", { id, name });
  try {
    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rows.length === 0) {
      console.log(`Kategorie mit ID ${id} nicht gefunden.`);
      return res.status(404).json({ error: "Kategorie nicht gefunden" });
    }
    console.log("Kategorie aktualisiert:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Fehler in PUT /categories/${id}:", err.message);
    res.status(500).json({ error: err.message });
  }
});
  
// 8.9 Eine Kategorie löschen
app.delete("/categories/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /categories/${id} aufgerufen`);
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      console.log(`Kategorie mit ID ${id} nicht gefunden.`);
      return res.status(404).json({ error: "Kategorie nicht gefunden" });
    }
    console.log("Kategorie gelöscht:", result.rows[0]);
    res.status(200).json({ message: "Kategorie gelöscht", category: result.rows[0] });
  } catch (err) {
    console.error("Fehler in DELETE /categories/${id}:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 8.10 Items einer Kategorie abrufen
app.get("/categories/:id/items", async (req, res) => {
  const { id } = req.params;
  console.log(`GET /categories/${id}/items aufgerufen`);
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE category_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      console.log(`Keine Items für Kategorie ID ${id} gefunden.`);
      return res.status(404).json({ error: "Keine Items in dieser Kategorie gefunden" });
    }
    console.log("Gefundene Items:", result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fehler in GET /categories/${id}/items:", err.message);
    res.status(500).json({ error: err.message });
  }
});
  
  

// 9. Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
