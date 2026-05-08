import "./App.css";

import { useState, useEffect } from "react";

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clickedIds, setClickedIds] = useState([]);

  const pokemonCount = 12;
  const minId = 1;
  const maxId = 493;

  const getUniqueRandomIds = (count, min, max) => {
    const ids = new Set();
    while (ids.size < count) {
      const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
      ids.add(randomId);
    }
    return Array.from(ids);
  };

  // Creates a shuffled copy of the array
  const shuffleCards = (cards) => {
    return [...cards].sort(() => Math.random() - 0.5);
  };

  // Shuffle and Score
  const handleCardClick = (id) => {
    setPokemonList(shuffleCards(pokemonList));

    if (clickedIds.includes(id)) {
      setScore(0);
      setClickedIds([]);
    } else {
      const newScore = score + 1;
      setScore(newScore);
      setClickedIds([...clickedIds, id]);

      // Update High Score if current score beats it
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      //   if newScore == 12... Win
    }
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      // 1. Create an array of IDs [1, 2, ..., 12]
      const ids = getUniqueRandomIds(pokemonCount, minId, maxId);

      // 2. Map those IDs into an array of Promises (fetch calls)
      const promises = ids.map(async (id) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          image: data.sprites.other["official-artwork"].front_default,
        };
      });

      // 3. Wait for all promises to resolve
      const results = await Promise.all(promises);

      setPokemonList(results);
    };

    fetchPokemon();
  }, []);

  return (
    <div className="App">
      <header className="header">
        <h1>Pokemon Memory Game</h1>
        <div className="scoreboard">
          <p>Current Score: {score}</p>
          <p>Best Score: {highScore}</p>
        </div>
      </header>

      <div className="card-container">
        {pokemonList.map((pokemon) => (
          <div
            key={pokemon.id}
            className="card"
            onClick={() => handleCardClick(pokemon.id)}
          >
            <img src={pokemon.image} alt={pokemon.name} />
            <p>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
