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

  const [difficulty, setDifficulty] = useState("easy");
  const [numToWin, setNumToWin] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [isVictorious, setIsVictorious] = useState(false);
  const [lastClickedName, setLastClickedName] = useState("");

  // Rules display
  const [activeRules, setActiveRules] = useState({
    target: 0,
    min: 1,
    max: 151,
  });

  const difficulties = [
    { name: "Easy", count: 5 },
    { name: "Medium", count: 10 },
    { name: "Hard", count: 20 },
    { name: "Pokemon Champion", count: "all" },
  ];

  // Helper
  const currentDiffIndex = difficulties.findIndex((diff) => {
    // 1. Calculate the current max possible
    const totalAvailable = maxRange - minRange + 1;

    // 2. Check if it matches a standard number (5, 10, 20)
    if (diff.count === numToFetch) return true;

    // 3. Special Check: Is this the "Champion" option AND is the user maxed out?
    if (diff.count === "all" && numToFetch >= totalAvailable) return true;

    return false;
  });

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

  const handleDifficultyChange = (e) => {
    const diffIndex = e.target.value;
    if (diffIndex === "") return;

    const selectedDiff = difficulties[diffIndex];

    if (selectedDiff.count !== "all") {
      setNumToFetch(selectedDiff.count);
    }
    if (selectedDiff.count === "all") {
      // Math: (Max - Min) + 1 gives us the total count
      const totalAvailable = maxRange - minRange + 1;
      setNumToFetch(totalAvailable);
    } else {
      setNumToFetch(selectedDiff.count);
    }
  };

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
    if (isGameOver === true) return;
    setPokemonList(shuffleCards(pokemonList));

    if (clickedIds.includes(id)) {
      setScore(0);
      setClickedIds([]);
      setIsGameOver(true);
      setIsDefeated(true);
      const loser = pokemonList.find((p) => p.id === id);
      setLastClickedName(loser.name);
    } else {
      const newScore = score + 1;
      setScore(newScore);
      setClickedIds([...clickedIds, id]);

      // Update High Score if current score beats it
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      if (newScore >= numToWin) {
        setIsGameOver(true);
        setIsVictorious(true);
      }
    }
  };

  //   Start the Game. Create an Array via Promises and Populate the List
  const fetchPokemon = async () => {
    // Make sure the NumToWin is <= totalAvailable Cards.
    const totalAvailable = maxRange - minRange + 1;
    const actualNum = Math.min(numToFetch, totalAvailable);
    setNumToWin(actualNum);

    // Store the rules
    setActiveRules({
      target: actualNum,
      min: minRange,
      max: maxRange,
    });

    // Reset the score and the clicked IDs array for a clean slate.
    setScore(0);
    setClickedIds([]);
    setIsGameOver(false);
    setIsVictorious(false);
    setIsDefeated(false);

    // 1. Create an array of IDs [1, 2, ..., 12]
    const ids = getUniqueRandomIds(actualNum, minRange, maxRange);

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
        <select
          value={currentDiffIndex !== -1 ? currentDiffIndex : ""}
          onChange={handleDifficultyChange}
        >
          <option value="">Custom / Select a Difficulty</option>
          {difficulties.map((diff, index) => (
            <option key={diff.name} value={index}>
              {diff.name}
            </option>
          ))}
        </select>

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

      {activeRules.target > 0 && (
        <div className="game-status-bar">
          <p>
            Currently catching <strong>{activeRules.target}</strong> Pokémon
            from ID <strong>{activeRules.min}</strong> to{" "}
            <strong>{activeRules.max}</strong>
          </p>
          <p>
            Score: {score} / {activeRules.target}
          </p>
        </div>
      )}

      {isGameOver && isVictorious && (
        <div className="victory-message">
          <h2>🎉 Victory! You caught all {numToWin} Pokemon! 🎉</h2>
        </div>
      )}

      {isGameOver && isDefeated && !isVictorious && (
        <div className="defeat-modal">
          <div className="defeat-content">
            <h2>Hey, don't be a thief!</h2>
            <p>
              That <strong>{lastClickedName.toUpperCase()}</strong> was already
              caught! Even a Magikarp could remember that.
            </p>
            <p>
              Final Score: {score} / {activeRules.target}
            </p>
            <button onClick={fetchPokemon}>Try Again</button>
          </div>
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
