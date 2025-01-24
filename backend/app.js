


// 1. Abhängigkeiten laden
const express = require("express"); // const bodyParser = require("body-parser");
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
  origin: ['https://magicalitems.netlify.app'], // Erlaube nur deine Frontend-Domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Erlaube spezifische HTTP-Methoden
  credentials: true, // Für Authentifizierung und Cookies, falls benötigt
};

// 3. Middleware
app.use(cors(corsOptions));
app.use(express.json());  // bodyParser mit express ersetzt
app.use(express.urlencoded({ extended: true }));

// Bereitstellen statischer Dateien
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.post("/items", upload.single("image"), async (req, res) => {
  console.log("POST /items aufgerufen");
  console.log("Request body:", req.body); // Request-Body loggen
  console.log("Uploaded file:", req.file); // Datei-Upload loggen

  // Werte aus req.body und req.file extrahieren
  const { name, price, mana, description, category_id } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/placeholder.jpg";

  console.log("Finaler Image-Wert:", imagePath);

  try {
    const query = `
      INSERT INTO items (name, price, mana, image, description, category_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [name, price, mana, imagePath, description, category_id];

    const result = await pool.query(query, values);
    console.log("Neues Item erstellt:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Fehler in POST /items:", error.message);
    res.status(500).json({ error: error.message });
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
  console.log(`PUT /items/${id} aufgerufen`);
  console.log("Daten für PUT /items:", { name, price, mana, description, category_id, image });

  try {
    const result = await pool.query(
      "UPDATE items SET name = $1, price = $2, mana = $3, image = COALESCE($4, image), description = $5, category_id = $6 WHERE id = $7 RETURNING *",
      [name, price, mana, image, description, category_id, id]
    );
    if (result.rows.length === 0) {
      console.log(`Item mit ID ${id} nicht gefunden.`);
      return res.status(404).json({ error: "Item nicht gefunden" });
    }
    console.log("Item aktualisiert:", result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Fehler in PUT /items/${id}:", err.message);
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
