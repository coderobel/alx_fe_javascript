const quote1 = {
  text: "I fear not an army of lions led by a sheep but an army of sheeps led by a lion",
  category: "ancient history quotes",
};
const quotes = [quote1];
function showRandomQuote(){
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><small>${randomQuote.category}</small>`;
};
function createAddQuoteForm(){
  quote = {};
  Quote = document.getElementById("newQuoteText");
  Category = document.getElementById("newQuoteCategory");
  newQuote = Quote.value.trim();
  newCategory = Quote.value.trim();
  quote.text = newQuote;
  quote.category = newCategory;
  quotes.append(quote);
};
