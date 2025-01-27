import { searchItems } from './api.js';

async function fetchSearchResults() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('q'); // Suchparameter auslesen

    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Ergebnisse leeren

    if (!search) {
        resultsContainer.innerHTML = '<p>Bitte geben Sie einen Suchbegriff ein.</p>';
        return;
    }

    try {
        const items = await searchItems({ search }); // Nur Suchparameter übergeben

        resultsContainer.innerHTML = items.length === 0
            ? '<p>Keine Ergebnisse gefunden.</p>'
            : items.map(item => `
                <div class="item-card">
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>Preis: ${item.price}</p>
                    <a href="/frontend/categories/detail.html?id=${item.id}" class="details-btn">Details ansehen</a>
                </div>
            `).join('');
    } catch (err) {
        console.error('Fehler beim Abrufen der Suchergebnisse:', err);
        resultsContainer.innerHTML = '<p>Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>';
    }
}

document.addEventListener('DOMContentLoaded', fetchSearchResults);
