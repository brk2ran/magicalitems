function getBasePath() {
  const path = window.location.pathname;
  return path.includes("/pages/") ? "../components/" : "./components/";
}

// Funktion zum Laden des Headers
async function loadHeader() {
    const headerContainer = document.getElementById("header");
    if (headerContainer) {
      try {
        const basePath = getBasePath(); // Ermitteln des richtigen Pfads
        const response = await fetch(`${basePath}header.html`);
        const html = await response.text();
        headerContainer.innerHTML = html;

        // Nach dem Laden des Headers die Interaktionen aktivieren
        initializeHeaderInteractions();
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
        const basePath = getBasePath(); // Ermitteln des richtigen Pfads
        const response = await fetch(`${basePath}footer.html`);
        const html = await response.text();
        footerContainer.innerHTML = html;
      } catch (error) {
        console.error("Fehler beim Laden des Footers:", error);
      }
    }
}

// Initialisiere Header-Interaktionen
function initializeHeaderInteractions() {
    const searchInput = document.getElementById('search-input');
    const headerFilters = document.getElementById('header-filters');

    if (searchInput && headerFilters) {
        // Beim Fokus das Filterfeld anzeigen
        searchInput.addEventListener('focus', () => {
            headerFilters.classList.remove('hidden');
            headerFilters.classList.add('visible');
        });

        // Beim Verlassen des Suchfeldes das Filterfeld ausblenden
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                headerFilters.classList.remove('visible');
                headerFilters.classList.add('hidden');
            }, 200);
        });
    }
}

// Beide Funktionen aufrufen
document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    loadFooter();
});
