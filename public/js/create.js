// const BASE_BACKEND_URL = "https://magicalitems.onrender.com"; // Basis-URL des Backends

// Funktion zum Verarbeiten des Formulars
document.getElementById("create-item-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindere das automatische Neuladen der Seite

  const form = event.target;
  const formData = new FormData(form); // Alle Formulareingaben und Dateien sammeln

  try {
    const response = await fetch("https://magicalitems.onrender.com/items", {
      method: "POST",
      body: formData, // FormData wird direkt gesendet
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Erstellen des Items: ${response.statusText}`);
    }

    const data = await response.json();
    alert("Item erfolgreich erstellt!");
    console.log("Erstelltes Item:", data);

    // Weiterleitung oder Reset des Formulars
    form.reset();
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Fehler:", error);
    alert("Fehler beim Erstellen des Items. Bitte versuchen Sie es erneut.");
  }
});

  // Event-Listener für das Formular
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  } else {
    console.error("Formular nicht gefunden");
  }
  
  