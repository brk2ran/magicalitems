const BASE_BACKEND_URL = "https://magicalitems.onrender.com"; // Basis-URL des Backends

async function handleFormSubmit(event) {
    event.preventDefault();
  
    const form = event.target;
    const formData = new FormData(form); // FormData enthält alle Form-Daten inkl. Dateien
  
    try {
      const response = await fetch(`https://magicalitems.onrender.com/items`, {
        method: "POST",
        body: formData, // Sende die FormData direkt an das Backend
      });
  
      if (!response.ok) {
        throw new Error(`Fehler beim Erstellen des Items: ${response.statusText}`);
      }
  
      const item = await response.json();
      console.log("Erfolgreich erstellt:", item);
      alert("Item erfolgreich erstellt!");
      window.location.href = "/index.html"; // Weiterleitung nach dem Erstellen
    } catch (error) {
      console.error("Fehler beim Erstellen des Items:", error);
      alert("Fehler beim Erstellen des Items. Bitte versuchen Sie es erneut.");
    }
  }
  
  // Event-Listener für das Formular
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  } else {
    console.error("Formular nicht gefunden");
  }
  