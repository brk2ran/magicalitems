document.getElementById("create-item-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Verhindere das automatische Neuladen der Seite

  const form = event.target;
  const formData = new FormData(form); // Sammle alle Formulareingaben und Dateien

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

    // Zurücksetzen des Formulars nach erfolgreicher Erstellung
    form.reset();
    window.location.href = "/index.html"; // Weiterleitung zur Startseite
  } catch (error) {
    console.error("Fehler beim Erstellen des Items:", error);
    alert("Fehler beim Erstellen des Items. Bitte versuchen Sie es erneut.");
  }
});
