// ==========================
// Dynamic Quote Generator
// ==========================

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const formContainer = document.getElementById("formContainer");

// ==========================
// Quotes Array & Storage
// ==========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "Happiness depends upon ourselves.", category: "Happiness" }
];

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==========================
// Display Random Quote
// ==========================
function showRandomQuote() {
  const filteredQuotes = filterSelectedQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerHTML = `"${filteredQuotes[randomIndex].text}" - ${filteredQuotes[randomIndex].category}`;
}

// ==========================
// Add Quote Form
// ==========================
function createAddQuoteForm() {
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
    <br><br>
    <select id="categoryFilter" onchange="filterQuotes()">
      <option value="all">All Categories</option>
    </select>
    <br><br>
    <button id="exportBtn">Export Quotes (JSON)</button>
    <input type="file" id="importFile" accept=".json" />
  `;

  // Event listeners
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJson);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  populateCategories();
}

// ==========================
// Add New Quote
// ==========================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Both fields are required!");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ==========================
// Populate Categories
// ==========================
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  
  // Restore last selected category
  const lastCategory = localStorage.getItem("lastCategory") || "all";
  categoryFilter.value = lastCategory;
}

// ==========================
// Filter Quotes
// ==========================
function filterSelectedQuotes() {
  const category = document.getElementById("categoryFilter")?.value || "all";
  localStorage.setItem("lastCategory", category);
  return category === "all" ? quotes : quotes.filter(q => q.category === category);
}

function filterQuotes() {
  showRandomQuote();
}

// ==========================
// JSON Export / Import
// ==========================
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==========================
// Server Sync & Conflict Resolution
// ==========================
// Mock server data
let serverQuotes = [
  { text: "Server quote 1", category: "Motivation" },
  { text: "Server quote 2", category: "Happiness" }
];

function fetchServerData() {
  setTimeout(() => {
    serverQuotes.forEach(sq => {
      const existsLocally = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
      if (!existsLocally) {
        quotes.push(sq); // server takes precedence
      }
    });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    notifyUser("Quotes synced with server.");
  }, 1000);
}

function notifyUser(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.backgroundColor = "#d4edda";
  notification.style.color = "#155724";
  notification.style.padding = "10px";
  notification.style.marginTop = "10px";
  notification.style.border = "1px solid #c3e6cb";
  notification.style.borderRadius = "5px";
  document.body.prepend(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Auto-sync every 30s
setInterval(fetchServerData, 30000);

// ==========================
// Initialize App
// ==========================
createAddQuoteForm();
showRandomQuote();
newQuoteBtn.addEventListener("click", showRandomQuote);

