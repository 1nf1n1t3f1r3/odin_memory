// Console Function to make an array out of the national ids for each pokemon in a regional pokedex
// Toss this into the console when looking at the pokeapi regional pokedex pages:
// https://pokeapi.co/api/v2/pokedex/kanto/
// https://pokeapi.co/api/v2/pokedex/original-johto/
// ...

// 1. Grab the text from the page
const rawData = document.body.innerText;

// 2. Convert that text into a JavaScript Object
const data = JSON.parse(rawData);

// 4. Loop through each entry and extract the ID from the URL
const nationalIds = data.pokemon_entries.map((entry) => {
  const url = entry.pokemon_species.url;
  const parts = url.split("/");
  // The ID is the second-to-last part because the URL ends in a '/'
  return parts[parts.length - 2];
});

nationalIds;
