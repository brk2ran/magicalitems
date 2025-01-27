import { searchItems } from './api.js';

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
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>Preis: ${item.price}</p>
                    <a href="/public/pages/detail.html?id=${item.id}" class="details-btn">Details ansehen</a>
                </div>
            `).join('');
    } catch (err) {
        console.error('Fehler beim Abrufen der Suchergebnisse:', err);
        resultsContainer.innerHTML = '<p>Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.</p>';
    }
}

document.addEventListener('DOMContentLoaded', fetchSearchResults);

document.getElementById('search-filter-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const query = new URLSearchParams(formData).toString();

    window.location.href = `/pages/search.html?${query}`;
});
