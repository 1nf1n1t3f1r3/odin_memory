import "./App.css";
import { useState, useEffect } from "react";

// Regional Pokedexes
import { regionalPokedexes } from "./pokedexData";
import { pokemonNames } from "./pokedexData";

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

  // ... inside your App component
  const regionalDexes = [
    { name: "National: Generation IX", ids: regionalPokedexes.national },
    {
      name: "Kanto: Red/Blue/Green/Yellow/FireRed/LeafGreen",
      ids: regionalPokedexes.rbgy,
    },
    { name: "Johto: Gold/Silver/Crystal", ids: regionalPokedexes.gsc },
    { name: "Hoenn: Ruby/Sapphire/Emerald", ids: regionalPokedexes.rse },

    {
      name: "Sinnoh: Diamond/Pearl/Brilliant Diamond/Shining Pearl",
      ids: regionalPokedexes.dp,
    },
    { name: "Sinnoh: Platinum", ids: regionalPokedexes.plat },
    { name: "Johto: Heartgold/Soulsilver", ids: regionalPokedexes.hgss },
    {
      name: "Unova: Black/White",
      ids: regionalPokedexes.bw,
    },
    {
      name: "Unova: Black 2/White 2",
      ids: regionalPokedexes.b2w2,
    },
    { name: "Kalos Central: X/Y", ids: regionalPokedexes.xycentral },
    { name: "Kalos Coastal: X/Y", ids: regionalPokedexes.xycoastal },
    { name: "Kalos Mountain: X/Y", ids: regionalPokedexes.xymountain },

    { name: "Hoenn: Omega Ruby/Alpha Saphhire", ids: regionalPokedexes.oras },
    { name: "Alola: Sun/Moon", ids: regionalPokedexes.sm },
    { name: "Alola: Ultra Sun/Ultra Moon", ids: regionalPokedexes.usum },
    {
      name: "Kanto: Let's go Pikachu/Let's go Eevee",
      ids: regionalPokedexes.lgplge,
    },

    {
      name: "Hisui: Legends:Arceus",
      ids: regionalPokedexes.la,
    },
    {
      name: "Paldea: Scarlet & Violet",
      ids: regionalPokedexes.sv,
    },
    // {
    //   name: "Kalos: Legends:Z-A",
    //   ids: regionalPokedexes.za,
    // },
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

  // regional select helper
  const squashConsecutive = (ids) => {
    if (ids.length === 0) return [];

    const result = [];
    let start = ids[0];
    let last = ids[0];

    for (let i = 1; i <= ids.length; i++) {
      const current = ids[i];

      // Check if the current number is exactly 1 more than the last one
      if (current && Number(current) === Number(last) + 1) {
        last = current;
      } else {
        // The chain broke! Save what we have.
        if (start === last) {
          result.push(`${start}`); // Just one number
        } else {
          result.push(`${start}-${last}`); // A range
        }
        // Start a new chain
        start = current;
        last = current;
      }
    }
    return result;
  };

  const getHintForInput = (inputStr) => {
    if (!inputStr) return "";

    // 1. Get the first number (handles "152-160" or just "152")
    const firstId = inputStr.split("-")[0].trim();

    // 2. Look it up in our big list
    const name = pokemonNames[firstId];

    return name ? `${name}` : "";
  };

  const handleRegionalSelect = (e) => {
    const selectedDex = regionalDexes.find(
      (dex) => dex.name === e.target.value,
    );

    if (selectedDex) {
      // 1. Take the raw IDs (e.g. ["152", "153", "154", "16"])
      const rawIds = selectedDex.ids;

      // 2. Squash them into ranges (e.g. ["152-154", "16"])
      const squashedRanges = squashConsecutive(rawIds);

      // 3. Set the state with our new list + the empty growth box
      setIdInputStrings([...squashedRanges, ""]);
    }
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

        <div className="preset-section">
          <label>Quick Select Region: </label>
          <select onChange={handleRegionalSelect} defaultValue="">
            <option value="" disabled>
              -- Choose a Region --
            </option>
            {regionalDexes.map((dex) => (
              <option key={dex.name} value={dex.name}>
                {dex.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Manual Entry (Hidden by default for Power Users) */}
        <details className="manual-details">
          <summary>Advanced: Custom ID Entry</summary>
          <div className="manual-input-section">
            <p className="help-text">
              Mix and match! Use ranges (1-151) or single IDs (25).
            </p>

            <div></div>
            {idInputStrings.map((str, index) => (
              <div>
                {" "}
                <input
                  key={index}
                  type="text"
                  value={str}
                  placeholder="Enter range..."
                  onChange={(e) =>
                    handleManualInputChange(index, e.target.value)
                  }
                />
                <span className="name-hint">{getHintForInput(str)}</span>
              </div>
            ))}
          </div>
        </details>
        <details>
          <summary>National Dex Reference</summary>
          {/* 3. National Dex Reference (Inside the same details or a new one) */}
          <div className="dex-reference-container">
            <div className="dex-list">
              {Object.entries(pokemonNames).map(([id, name]) => (
                <div key={id} className="dex-item">
                  <span className="dex-id">#{id} </span>
                  <span className="dex-name">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </details>

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
            <h2>
              {numToWin >= 1000
                ? `👑 The Very Best! Caught ${numToWin} Pokémon! Gotta catch 'em all!`
                : numToWin >= 151
                  ? `🏆 Beat Rival Blue! Caught ${numToWin} Pokémon. That's an entire Generation!`
                  : numToWin >= 50
                    ? `🌊 Beat Misty! Caught ${numToWin} Pokémon. Caught any Bug Pokémon?`
                    : numToWin >= 25
                      ? `🚀 Beat Team Rocket! Caught ${numToWin} Pokémon! Prepare for trouble!`
                      : numToWin >= 15
                        ? `🪨 Beat Brock! Bred ${numToWin} Pokémon! Brock on!`
                        : `🩳 Beat Youngster Joey! Caught ${numToWin} Pokémon with their shorts down!`}
            </h2>
          ) : (
            <div className="defeat-content">
              <h2>Hey, don't be a thief!</h2>
              <p>
                You already caught{" "}
                <strong>{lastClickedName.toUpperCase()}</strong>!
              </p>
              <button onClick={prepareGame}>Try Again?</button>
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
