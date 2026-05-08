import "./App.css";

import { useState, useEffect } from "react";

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clickedIds, setClickedIds] = useState([]);

  const [numToFetch, setNumToFetch] = useState(12);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(151);

  const [numToWin, setNumToWin] = useState(0);

  // Data Holder for Pokemon Generations
  const generations = [
    { name: "All Generations", min: 1, max: 493 },
    { name: "Generation 1", min: 1, max: 151 },
    { name: "Generation 2", min: 152, max: 251 },
    { name: "Generation 3", min: 252, max: 386 },
  ];

  //    Helper to see if we have a Generation selected or not
  const currentGenIndex = generations.findIndex(
    (gen) => gen.min === minRange && gen.max === maxRange,
  );

  // Input Logic for selecting a Generation via the Generation Dropdown
  const handleGenChange = (e) => {
    const genIndex = e.target.value;
    if (genIndex === "") return; // Handle the placeholder case

    const selectedGen = generations[genIndex];
    setMinRange(selectedGen.min);
    setMaxRange(selectedGen.max);
  };

  // Get Random IDs to Populate with
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

  // Click a Card. Shuffle and Score
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
      //   if (newScore === numToWin) {
      //     {
      //       score === numToWin && numToWin > 0 && (
      //         <div className="victory-message">
      //           <h2>🎉 Victory! You caught all {numToWin} Pokemon! 🎉</h2>
      //         </div>
      //       );
      //     }
      //   }
    }
  };

  //   Start the Game. Create an Array via Promises and Populate the List
  const fetchPokemon = async () => {
    // Lock in the Victory Number when we start the game, reset the score and the clicked IDs array for a clean slate
    setNumToWin(numToFetch);
    setScore(0);
    setClickedIds([]);

    // 1. Create an array of IDs [1, 2, ..., 12]
    const ids = getUniqueRandomIds(numToFetch, minRange, maxRange);

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

  return (
    <div className="App">
      <header className="header">
        <h1>Pokemon Memory Game</h1>
        <div className="scoreboard">
          <p>Current Score: {score}</p>
          <p>Best Score: {highScore}</p>
        </div>
      </header>

      <div className="inputSettings">
        <label>
          Number of Cards:
          <input
            type="number"
            value={numToFetch}
            onChange={(e) => setNumToFetch(parseInt(e.target.value))}
          />
        </label>
        <label>
          Start ID:
          <input
            type="number"
            value={minRange}
            onChange={(e) => setMinRange(parseInt(e.target.value))}
          />
        </label>
        <label>
          Max ID:
          <input
            type="number"
            value={maxRange}
            onChange={(e) => setMaxRange(parseInt(e.target.value))}
          />
        </label>
        <select
          value={currentGenIndex !== -1 ? currentGenIndex : ""}
          onChange={handleGenChange}
        >
          <option value="">Custom / Select a Generation</option>
          {generations.map((gen, index) => (
            <option key={gen.name} value={index}>
              {gen.name}
            </option>
          ))}
        </select>
      </div>
      <div className="startButton">
        <button onClick={fetchPokemon}>I choose you!</button>
      </div>

      {score === numToWin && numToWin > 0 && (
        <div className="victory-message">
          <h2>🎉 Victory! You caught all {numToWin} Pokemon! 🎉</h2>
        </div>
      )}

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
