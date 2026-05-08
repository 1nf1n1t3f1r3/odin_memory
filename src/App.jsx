import "./App.css";

import { useState, useEffect } from "react";

function App() {
  const [pokemonList, setPokemonList] = useState([]);

  useEffect(() => {
    const fetchPokemon = async () => {
      const pokemonData = [];

      for (let i = 1; i <= 12; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const data = await response.json();

        // Push a clean object into our temporary array
        pokemonData.push({
          id: data.id,
          name: data.name,
          image: data.sprites.other["official-artwork"].front_default,
        });
      }

      setPokemonList(pokemonData);
    };

    fetchPokemon();
  }, []);

  return (
    <div className="card-container">
      {pokemonList.map((pokemon) => (
        <div key={pokemon.id} className="card">
          <img src={pokemon.image} alt={pokemon.name} />
          <p>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
        </div>
      ))}
    </div>
  );
}
export default App;
