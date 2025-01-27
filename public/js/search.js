import { searchItems } from './api.js';
const BASE_BACKEND_URL = "https://magicalitems.onrender.com"; // Basis-URL des Backends


async function fetchSearchResults() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('q');
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const category_id = params.get('category_id');

    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Ergebnisse leeren

    if (!search && !minPrice && !maxPrice && !category_id) {
        resultsContainer.innerHTML = '<p>Bitte geben Sie einen Suchbegriff ein oder setzen Sie Filter.</p>';
        return;
    }

    try {
        const items = await searchItems({ search, minPrice, maxPrice, category_id });

        resultsContainer.innerHTML = items.length === 0
            ? '<p>Keine Ergebnisse gefunden.</p>'
            : items.map(item => `
              <div class="item-card">
                <img src="${BASE_BACKEND_URL}${item.image}" alt="${item.name}" />
                <h3><strong>${item.name}</strong></h3>
                <p><strong>Preis:</strong> ${item.price}</p>
                <p><strong>Mana:</strong> ${item.mana}</p>
                <p><strong>Beschreibung:</strong> ${item.description}</p>
                <button class="details-btn" onclick="window.location.href='detail.html?id=${item.id}'">Details ansehen</button>
              </div>
            `).join('');
    } catch (err) {
        console.error('Fehler beim Abrufen der Suchergebnisse:', err);
        resultsContainer.innerHTML = '<p>Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>';
    }
}

document.getElementById('search-filter-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const query = new URLSearchParams(formData).toString();

    window.location.href = `/pages/search.html?${query}`;
});

document.addEventListener('DOMContentLoaded', fetchSearchResults);

