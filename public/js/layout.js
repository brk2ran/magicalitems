// public/js/layout.js

// Funktion zum Laden des Headers
async function loadHeader() {
    const headerContainer = document.getElementById("header");
    if (headerContainer) {
      try {
        const response = await fetch("./components/header.html");
        const html = await response.text();
        headerContainer.innerHTML = html;
      } catch (error) {
        console.error("Fehler beim Laden des Headers:", error);
      }
    }
  }
  
  // Funktion zum Laden des Footers
  async function loadFooter() {
    const footerContainer = document.getElementById("footer");
    if (footerContainer) {
      try {
        const response = await fetch("./components/footer.html");
        const html = await response.text();
        footerContainer.innerHTML = html;
      } catch (error) {
        console.error("Fehler beim Laden des Footers:", error);
      }
    }
  }
  
  // Beide Funktionen aufrufen
  document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    loadFooter();
  });
  