// ========================
// Quotes Array & Storage
// ========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "Happiness depends upon ourselves.", category: "Happiness" }
];

// Last viewed quote (optional session storage)
let lastQuote = sessionStorage.getItem("lastQuote");

// ========================
// DOM Elements
// ========================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const formContainer = document.getElementById("formContainer");

// ========================
// Display Random Quote
// ========================
function displayRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" — <strong>${quote.category}</strong>`;
  sessionStorage.setItem("lastQuote", quote.text);
}

// ========================
// Add New Quote
// ========================
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuoteObj = { text: newText, category: newCategory };
  quotes.push(newQuoteObj);
  saveQuotes();
  displayRandomQuote();
  populateCategories();
  postQuotesToServer(newQuoteObj); // Sync new quote with server

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ========================
// Save to Local Storage
// ========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ========================
// Populate Categories
// ========================
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastCat = localStorage.getItem("lastCategory") || "all";
  categoryFilter.value = lastCat;
}

// ========================
// Filter Quotes
// ========================
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", category);

  if (category === "all") {
    displayRandomQuote(quotes);
  } else {
    displayRandomQuote(quotes.filter(q => q.category === category));
  }
}

// ========================
// Export to JSON
// ========================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ========================
// Import from JSON
// ========================
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayRandomQuote();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Invalid JSON file.");
      console.error(error);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========================
// Server Sync & Conflict Resolution
// ========================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.map(item => ({ text: item.title, category: "Server" }));
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

async function postQuotesToServer(newQuote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  let updated = false;
  serverQuotes.forEach(sq => {
    if (!quotes.some(q => q.text === sq.text && q.category === sq.category)) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    displayRandomQuote();
    alert("Quotes updated from server!");
    populateCategories();
  }
}

// ========================
// Initialize Form & Event Listeners
// ========================
function createAddQuoteForm() {
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
    <br><br>
    <button onclick="exportToJsonFile()">Export Quotes</button>
    <input type="file" id="importFile" accept=".json" onchange="importFromJsonFile(event)" />
    <br><br>
    <select id="categoryFilter" onchange="filterQuotes()">
      <option value="all">All Categories</option>
    </select>
  `;
}

// ========================
// Initial Setup
// ========================
createAddQuoteForm();
populateCategories();
displayRandomQuote();
newQuoteBtn.addEventListener("click", () => displayRandomQuote());
syncQuotes();
setInterval(syncQuotes, 60000); // Periodic sync every 60s

