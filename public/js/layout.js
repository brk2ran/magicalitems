function getBasePath() {
  const path = window.location.pathname;
  return path.includes("/pages/") ? "../components/" : "./components/";
}

// Funktion zum Laden des Headers
async function loadHeader(callback) {
    const headerContainer = document.getElementById("header");
    if (headerContainer) {
        try {
            const basePath = getBasePath();
            const response = await fetch(`${basePath}header.html`);
            const html = await response.text();
            headerContainer.innerHTML = html;

            initializeHeaderInteractions(); // Interaktionen aktivieren

            if (callback) callback(); // 🔥 WICHTIG: Callback aufrufen, nachdem der Header geladen wurde
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
            const basePath = getBasePath();
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

      // Sicherstellen, dass Filter bei Interaktion sichtbar bleiben
      headerFilters.addEventListener('mouseenter', () => {
          headerFilters.classList.remove('hidden');
          headerFilters.classList.add('visible');
      });

      // Beim Verlassen (blur) des Suchfelds oder der Filter-Eingabefelder ausblenden
      const hideFilters = (event) => {
          setTimeout(() => {
              // Überprüfen, ob weder das Suchfeld noch die Filter den Fokus haben
              if (
                  !searchInput.matches(':focus') &&
                  !headerFilters.matches(':hover')
              ) {
                  headerFilters.classList.remove('visible');
                  headerFilters.classList.add('hidden');
              }
          }, 200); // Kurze Verzögerung, um Klicks auf die Filterfelder zu erlauben
      };

      searchInput.addEventListener('blur', hideFilters);
      headerFilters.addEventListener('mouseleave', hideFilters);
  }
}

// Beide Funktionen aufrufen, Suche fixen!
document.addEventListener("DOMContentLoaded", () => {
    loadHeader(() => {
        // 🔥 FIX: Event-Listener erst nach dem Laden des Headers setzen!
        const form = document.getElementById('search-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const query = new URLSearchParams(formData).toString();
                window.location.href = `/pages/search.html?${query}`;
            });
            console.log("Suchformular-Event-Listener wurde erfolgreich gesetzt! ✅");
        } else {
            console.error("Suchformular wurde nicht gefunden! ❌");
        }
    });

    loadFooter();
});
