import "./App.css";
import { useState, useEffect } from "react";

function App() {
  // --- Game State ---
  const [pokemonList, setPokemonList] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clickedIds, setClickedIds] = useState([]);

  // --- Configuration State ---
  const [requestedCount, setRequestedCount] = useState(12);
  const [idInputStrings, setIdInputStrings] = useState([""]); // The dynamic input boxes
  const [numToWin, setNumToWin] = useState(0);

  // --- UI/Status State ---
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictorious, setIsVictorious] = useState(false);
  const [lastClickedName, setLastClickedName] = useState("");
  const [activeRules, setActiveRules] = useState({
    target: 0,
    description: "",
  });

  // --- Constants & Data ---
  const difficulties = [
    { name: "Easy", count: 10 },
    { name: "Medium", count: 15 },
    { name: "Hard", count: 25 },
    { name: "Pokemon Champion", count: 2500 },
  ];

  const regionalDexes = [
    { name: "National (Gen 1-4)", ids: "1-493" },
    { name: "Kanto (Original)", ids: "1-151" },
    { name: "Johto (Original)", ids: "152-251" },
    { name: "Sinnoh (DP)", ids: "387-493" },
  ];

  // --- Logic Helpers ---

  // --- 1. The Parser Helper ---
  const parseIdInputs = (inputArray) => {
    const pool = new Set();

    inputArray.forEach((str) => {
      const trimmed = str.trim();
      if (!trimmed) return;

      // Handle Ranges (e.g., "1-151")
      if (trimmed.includes("-")) {
        const [start, end] = trimmed
          .split("-")
          .map((num) => parseInt(num.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          // Ensure we handle reverse ranges like 10-1 gracefully
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let i = min; i <= max; i++) {
            pool.add(i);
          }
        }
      }
      // Handle Single IDs (e.g., "25")
      else {
        const id = parseInt(trimmed);
        if (!isNaN(id)) pool.add(id);
      }
    });

    return Array.from(pool);
  };

  const getRandomSelection = (count, idPool) => {
    const selected = new Set();
    const actualCount = Math.min(count, idPool.length);

    while (selected.size < actualCount) {
      const randomIndex = Math.floor(Math.random() * idPool.length);
      selected.add(idPool[randomIndex]);
    }
    return Array.from(selected);
  };

  const shuffleCards = (cards) => [...cards].sort(() => Math.random() - 0.5);

  // --- Event Handlers ---

  const handleManualInputChange = (index, value) => {
    // Use a Regex to remove any character that isn't a digit or a dash
    const cleanValue = value.replace(/[^0-9-]/g, "");

    const newInputs = [...idInputStrings];
    newInputs[index] = cleanValue;

    if (index === idInputStrings.length - 1 && cleanValue.trim() !== "") {
      newInputs.push("");
    }
    setIdInputStrings(newInputs);
  };

  const handleCardClick = (id) => {
    if (isGameOver) return;
    setPokemonList(shuffleCards(pokemonList));

    if (clickedIds.includes(id)) {
      setScore(0);
      setClickedIds([]);
      setIsGameOver(true);
      const loser = pokemonList.find((p) => p.id === id);
      setLastClickedName(loser?.name || "Unknown");
    } else {
      const newScore = score + 1;
      setScore(newScore);
      setClickedIds([...clickedIds, id]);

      if (newScore > highScore) setHighScore(newScore);
      if (newScore >= numToWin) {
        setIsGameOver(true);
        setIsVictorious(true);
      }
    }
  };

  // --- The "Brain" (Coming Soon) ---
  // This is where we will eventually parse the strings and call loadGameWithIds
  // --- 2. The "Brain" (Wired to the button) ---
  const prepareGame = () => {
    // Convert all those text boxes into a flat list of numbers
    const finalPool = parseIdInputs(idInputStrings);

    if (finalPool.length === 0) {
      alert("Please enter at least one valid Pokémon ID or range!");
      return;
    }

    // Pass the pool to the loader
    loadGameWithIds(finalPool);
  };

  const loadGameWithIds = async (finalIdList) => {
    const idsToFetch = getRandomSelection(requestedCount, finalIdList);
    const actualNum = idsToFetch.length;

    setNumToWin(actualNum);
    setActiveRules({ target: actualNum, description: "Custom Selection" });

    // Reset game state
    setScore(0);
    setClickedIds([]);
    setIsGameOver(false);
    setIsVictorious(false);

    const promises = idsToFetch.map(async (id) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        image: data.sprites.other["official-artwork"].front_default,
      };
    });

    const results = await Promise.all(promises);
    setPokemonList(results);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Pokémon Memory Game</h1>
        <div className="scoreboard">
          <p>Current Score: {score}</p>
          <p>Best Score: {highScore}</p>
        </div>
      </header>

      <section className="controls">
        <div className="difficulty-settings">
          <label>Difficulty:</label>
          <select
            onChange={(e) =>
              setRequestedCount(difficulties[e.target.value].count)
            }
          >
            {difficulties.map((diff, index) => (
              <option key={diff.name} value={index}>
                {diff.name}
              </option>
            ))}
          </select>

          <label>Custom Count:</label>
          <input
            type="number"
            value={typeof requestedCount === "number" ? requestedCount : 0}
            onChange={(e) => setRequestedCount(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="manual-input-section">
          <h3>
            Custom ID Entry (e.g. "1-151" for Generation 1 or "25" for Pikachu)
          </h3>
          {idInputStrings.map((str, index) => (
            <input
              key={index}
              type="text"
              value={str}
              placeholder="Enter range..."
              onChange={(e) => handleManualInputChange(index, e.target.value)}
            />
          ))}
        </div>

        <button className="start-btn" onClick={prepareGame}>
          I Choose You!
        </button>
      </section>

      {activeRules.target > 0 && (
        <div className="game-status-bar">
          <p>
            Catching <strong>{numToWin}</strong> Pokémon | Score: {score}/
            {numToWin}
          </p>
        </div>
      )}

      {/* Modals for Victory/Defeat */}
      {isGameOver && (
        <div className="modal">
          {isVictorious ? (
            <h2>🎉 Victory! Caught all {numToWin}! 🎉</h2>
          ) : (
            <div className="defeat-content">
              <h2>Hey, don't be a thief!</h2>
              <p>
                You already caught{" "}
                <strong>{lastClickedName.toUpperCase()}</strong>!
              </p>
              <button onClick={prepareGame}>Try Again</button>
            </div>
          )}
        </div>
      )}

      <main className="card-container">
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
      </main>
    </div>
  );
}

export default App;
