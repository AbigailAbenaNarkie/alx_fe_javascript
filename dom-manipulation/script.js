// Initial quotes array
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", category: "Happiness" },
  { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available. Please add some!</em>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<q>${quote.text}</q> — <strong>${quote.category}</strong>`;
}

// Function to add a new quote
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
  showRandomQuote();
}

// Function to create the Add Quote form dynamically
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

// Event listener for showing a new random quote
newQuoteBtn.addEventListener('click', showRandomQuote);

// Initialize dynamic form and show a quote on page load
createAddQuoteForm();
showRandomQuote();

