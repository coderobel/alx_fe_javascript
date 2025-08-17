const quote1 = {
  text: "I fear not an army of lions led by a sheep but an army of sheeps led by a lion",
  category: "ancient history quotes"
};
const quotes = [quote1];
function showRandomQuote(){
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><small>${randomQuote.category}</small>`;
};
function createAddQuoteForm(){
  const Quote = document.getElementById("newQuoteText");
  const Category = document.getElementById("newQuoteCategory");
  const newQuote = Quote.value.trim();
  const newCategory = Category.value.trim();
  const quote = {
    text: newQuote,
    category: newCategory
  };
  quotes.push(quote);
  localStorage.setItem(quotes, quote)
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const quoteTextEL = document.createElement("p");
  quoteTextEL.textContent = quote.text;

  const categoryTextEL = document.createElement("small");
  categoryTextEL.textContent = quote.category;

  quoteDisplay.appendChild(quoteTextEL);
  quoteDisplay.appendChild(categoryEL);
};
document.addEventListener("DOMContentLoaded", function (){
   const ShowNewQuoteButton = document.getElementById("newQuote");
   ShowNewQuoteButton.addEventListener("click", showRandomQuote);
   const Add_Quote = document.getElementById("Add-Quote");
   Add_Quote.addEventListener("click", createAddQuoteForm);
});
