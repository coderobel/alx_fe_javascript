const quote1 = {
  id : generateId(),
  text: "I fear not an army of lions led by a sheep but an army of sheeps led by a lion",
  category: "ancient history quotes",
  updatedAt: new Date().toISOString()
};
const quotes = [quote1];
function showRandomQuote(){
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  sessionStorage.setItem("lastquote", JSON.stringify(randomQuote));
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><small>${randomQuote.category}</small>`;
};
function createAddQuoteForm(){
  const Quote = document.getElementById("newQuoteText");
  const Category = document.getElementById("newQuoteCategory");
  const newQuote = Quote.value.trim();
  const newCategory = Category.value.trim();

  if(!newQuote || !newCategory) {
    alert("please enter both a quote and a category!");
    return;
  }

  const quote = {
    id: generateId(),
    text: newQuote,
    category: newCategory,
    updatedAt: new Date().toISOString()
  };
  quotes.push(quote);
  populateCategories();
  localStorage.setItem("quotes", JSON.stringify(quotes));
  
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const quoteTextEL = document.createElement("p");
  quoteTextEL.textContent = quote.text;

  const categoryTextEL = document.createElement("small");
  categoryTextEL.textContent = quote.category;

  quoteDisplay.appendChild(quoteTextEL);
  quoteDisplay.appendChild(categoryTextEL);
};
function exportQuotes(){
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file){
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          localStorage.setItem("quotes", JSON.stringify(quotes));
          alert("Quotes imported successfully!");
      }else{
        alert("Invalid JSON format.Must be an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
}
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  localStorage.setItem("selectedCategory", selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filtered = selectedCategory === "all"
  ? quotes
  : quotes.filter(q => q.category === selectedCategory);

  filtered.forEach(quote => {
    const quoteTextEL = document.createElement("p");
    quoteTextEL.textContent = quote.text;

    const categoryTextEL = document.createElement("small");
    categoryTextEL.textContent = quote.category;

    quoteDisplay.appendChild(quoteTextEL);
    quoteDisplay.appendChild(categoryTextEL);
  });
}
function generateId(){
  return 'q_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
}
functionsaveQuotes(){
  localStorage.setItem("quotes", JSON.stringify(quotes));
}
function loadQuotesFromStorage() {
  const saved = JSON.parse(localStorage.getItem("quotes") || "null")
  if (Array.isArray(saved) && saved.length) { 
    quotes.length = 0;
    quotes.push(...saved);
  }
}
// --- CONFIG ---
const MOCK_SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // example placeholder (adapt)
const SYNC_INTERVAL_MS = 30_000; // poll every 30 seconds

// --- Sync function ---
async function syncWithServer() {
  try {
    // 1) Fetch server quotes (simulate: GET endpoint returning array of quotes)
    const res = await fetch(MOCK_SERVER_URL);
    if (!res.ok) throw new Error("Failed to fetch server data");
    const serverData = await res.json(); // expected: [{ id, text, category, updatedAt }, ...]
    
    // If the mock endpoint doesn't return our shape, you'll adapt the mapping here.
    // For now assume serverData is array of quote objects with id/updatedAt.

    // 2) Build indexes for quick lookup
    const localById = Object.fromEntries(quotes.map(q => [q.id, q]));
    const serverById = Object.fromEntries(serverData.map(q => [q.id, q]));

    // 3) Merge: for each server item, compare vs local
    let changes = { added: 0, updated: 0 };
    for (const sid in serverById) {
      const sItem = serverById[sid];
      const lItem = localById[sid];

      if (!lItem) {
        // server has a quote we don't — add it
        quotes.push(sItem);
        changes.added++;
      } else if (lItem.updatedAt !== sItem.updatedAt || lItem.text !== sItem.text || lItem.category !== sItem.category) {
        // conflict or update — resolve by timestamp (server wins if server is newer)
        const serverTime = new Date(sItem.updatedAt).getTime();
        const localTime = new Date(lItem.updatedAt).getTime();

        if (serverTime > localTime) {
          // server is newer -> replace local
          Object.assign(lItem, sItem);
          changes.updated++;
        } else if (localTime > serverTime) {
          // local is newer -> push local to server (optimistic attempt)
          // optional: call pushQuoteToServer(lItem)
        } else {
          // same timestamp but different content -> server wins (or show conflict modal)
          Object.assign(lItem, sItem);
          changes.updated++;
        }
      }
    }

    // 4) Check for local items that server doesn't have (local-only)
    for (const lid in localById) {
      if (!serverById[lid]) {
        // Option: push new local quotes to server
        // await pushQuoteToServer(localById[lid]); // optional
      }
    }

    if (changes.added || changes.updated) {
      saveQuotes();
      populateCategories();
      renderQuotesForCurrentFilter();
      showNotification(`Synced: +${changes.added} added, ${changes.updated} updated from server.`);
    }
  } catch (err) {
    console.error("Sync failed:", err);
    showNotification("Sync failed: " + err.message, true);
  }
}

// start polling
let syncInterval = null;
function startSyncPolling() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(syncWithServer, SYNC_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", function (){
   const ShowNewQuoteButton = document.getElementById("newQuote");
   ShowNewQuoteButton.addEventListener("click", showRandomQuote);

   const Add_Quote = document.getElementById("Add-Quote");
   Add_Quote.addEventListener("click", createAddQuoteForm);

   const savedQuotes = JSON.parse(localStorage.getItem("quotes"));
   if (savedQuotes) {
    quotes.push(...savedQuotes);
   }
   populateCategories();
});