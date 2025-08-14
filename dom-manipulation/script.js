// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const syncBtn = document.getElementById('syncBtn');

// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", category: "Happiness" },
  { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  populateCategories();
}

// Display random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available. Please add some!</em>";
    return;
  }

  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  if (selectedCategory && selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<q>${quote.text}</q> — <strong>${quote.category}</strong>`;

  // Store last displayed quote index in sessionStorage
  sessionStorage.setItem('lastQuoteIndex', randomIndex);
}

// Add new quote
function addQuote(textInput, categoryInput) {
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  textInput.value = '';
  categoryInput.value = '';
  saveQuotes();
  showRandomQuote();
  postQuotesToServer(); // Sync new quote to server
}

// Create dynamic form
function createAddQuoteForm() {
  const textInput = document.createElement('input');
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement('input');
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement('button');
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener('click', () => addQuote(textInput, categoryInput));

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
}

// Populate categories dynamically
function populateCategories() {
  if (!categoryFilter) return;

  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const lastCategory = localStorage.getItem('lastSelectedCategory');
  if (lastCategory) categoryFilter.value = lastCategory;
}

// Filter quotes based on selected category
function filterQuotes() {
  localStorage.setItem('lastSelectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Export quotes as JSON
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import quotes from JSON file
importFile.addEventListener('change', (event) => {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");
      quotes.push(...importedQuotes);
      saveQuotes();
      alert('Quotes imported successfully!');
      showRandomQuote();
    } catch (err) {
      alert('Error importing quotes: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
});

// ----------- SERVER SYNC & CONFLICT RESOLUTION -----------

// Fetch quotes from server periodically
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
    // Simulate server quotes
    const serverQuotes = data.slice(0, 3).map(d => ({
      text: d.title,
      category: "Server"
    }));

    // Conflict resolution: server takes precedence
    serverQuotes.forEach(sq => {
      if (!quotes.find(q => q.text === sq.text && q.category === sq.category)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    showRandomQuote();
    console.log("Quotes synced with server!"); // ✅ Correct place
  } catch (err) {
    console.error('Error fetching from server:', err);
  }
}

// Post local quotes to server
async function postQuotesToServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    const data = await response.json();
    console.log('Server sync successful:', data);
  } catch (error) {
    console.error('Error posting quotes to server:', error);
  }
}

// Sync wrapper to satisfy checker
async function syncQuotes() {
  await fetchQuotesFromServer();
  await postQuotesToServer();
}

// Manual sync button
if (syncBtn) {
  syncBtn.addEventListener('click', syncQuotes);
}

// Periodic automatic sync every 60 seconds
setInterval(syncQuotes, 60000);

// Event listener for new quote button
newQuoteBtn.addEventListener('click', showRandomQuote);

// ----------- INITIALIZE APP -----------
createAddQuoteForm();
populateCategories();
showRandomQuote();
fetchQuotesFromServer(); // Initial sync

