import { searchItems } from './api.js';

const BASE_BACKEND_URL = "https://magicalitems.onrender.com";

async function fetchAndDisplayResults() {
  const params = new URLSearchParams(window.location.search);
  const searchParams = {
    search: params.get('search'),
    minPrice: params.get('minPrice'),
    maxPrice: params.get('maxPrice'),
    category_id: params.get('category_id')
  };

  const resultsContainer = document.getElementById('results-container');
  resultsContainer.innerHTML = '<div class="loading">Suche läuft...</div>';

  try {
    const items = await searchItems(searchParams);
    displayResults(items);
  } catch (error) {
    resultsContainer.innerHTML = `
      <div class="error">
        <p>Fehler bei der Suche: ${error.message}</p>
        <button onclick="window.location.reload()">Erneut versuchen</button>
      </div>
    `;
  }
}

function displayResults(items) {
  const resultsContainer = document.getElementById('results-container');
  
  if (!items || items.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>Keine Items gefunden</p>
        <button onclick="window.location.href='/index.html'">Zurück zur Startseite</button>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = items.map(item => `
    <div class="item-card">
      <img src="${BASE_BACKEND_URL}${item.image}" alt="${item.name}" onerror="this.src='${BASE_BACKEND_URL}/uploads/placeholder.jpg'">
      <h3>${item.name}</h3>
      <p class="price">${item.price} Gold</p>
      <p class="mana">${item.mana} Mana</p>
      <div class="description">${item.description}</div>
      <a href="./detail.html?id=${item.id}" class="details-btn">Details anzeigen</a>
    </div>
  `).join('');
}

// Initialize search when page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayResults();
  
  // Preserve form values in search page
  const params = new URLSearchParams(window.location.search);
  document.getElementById('search-input').value = params.get('search') || '';
  document.getElementById('minPrice').value = params.get('minPrice') || '';
  document.getElementById('maxPrice').value = params.get('maxPrice') || '';
});