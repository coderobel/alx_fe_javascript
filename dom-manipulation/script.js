const quote1 = {
  text: "I fear not an army of lions led by a sheep but an army of sheeps led by a lion",
  category: "ancient history quotes"
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
    text: newQuote,
    category: newCategory
  };
  quotes.push(quote);
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
});