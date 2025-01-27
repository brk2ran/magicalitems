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

      // Beim Fokus auf die Filter-Eingabefelder ebenfalls sichtbar halten
      headerFilters.addEventListener('focusin', () => {
          headerFilters.classList.remove('hidden');
          headerFilters.classList.add('visible');
      });

      // Beim Verlassen (blur) des Suchfelds oder der Filter-Eingabefelder ausblenden
      const hideFilters = () => {
          setTimeout(() => {
              // Überprüfen, ob weder das Suchfeld noch die Filter den Fokus haben
              if (!searchInput.matches(':focus') && !headerFilters.matches(':focus-within')) {
                  headerFilters.classList.remove('visible');
                  headerFilters.classList.add('hidden');
              }
          }, 200); // Kurze Verzögerung, um Klicks auf die Filterfelder zu erlauben
      };

      searchInput.addEventListener('blur', hideFilters);
      headerFilters.addEventListener('focusout', hideFilters);
  }
}


// Beide Funktionen aufrufen
document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    loadFooter();
});
