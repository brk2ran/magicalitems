document.addEventListener("DOMContentLoaded", () => {
    // Karte initialisieren
    const map = L.map("map").setView([52.5200, 13.4050], 13); // Beispielkoordinaten: Berlin

    // OpenStreetMap-Kachel hinzufügen
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
    }).addTo(map);

    // Marker auf der Karte setzen
    L.marker([52.5200, 13.4050])
        .addTo(map)
        .bindPopup("Standort Berlin")
        .openPopup();
});

// Kontaktformular-Validierung
document.getElementById("contact-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Verhindert das Absenden des Formulars

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name) {
        alert("Bitte geben Sie Ihren Namen ein.");
        return;
    }

    if (!email || !validateEmail(email)) {
        alert("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        return;
    }

    if (!message || message.length < 10) {
        alert("Die Nachricht muss mindestens 10 Zeichen lang sein.");
        return;
    }

    alert("Vielen Dank für Ihre Nachricht!");

    document.getElementById("contact-form").reset();

});

// Hilfsfunktion zur Validierung der E-Mail-Adresse
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}