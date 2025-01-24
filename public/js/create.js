import { createItem } from "./api.js";

document.getElementById("create-item-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindere das automatische Neuladen der Seite

  const form = event.target;
  const formData = new FormData(form); // Sammle alle Formulareingaben und Dateien

  try {
    // Verwende die createItem-Funktion aus api.js
    const data = await createItem(formData);

    alert("Item erfolgreich erstellt!");
    console.log("Erstelltes Item:", data);

    // Zurücksetzen des Formulars nach erfolgreicher Erstellung
    form.reset();
    window.location.href = "/index.html"; // Weiterleitung zur Startseite
  } catch (error) {
    console.error("Fehler beim Erstellen des Items:", error);
    alert("Fehler beim Erstellen des Items. Bitte versuchen Sie es erneut.");
  }
});
