import "./App.css";
import { useState } from "react";
import { regionalPokedexes, pokemonNames } from "./pokedexData";

// --- Import Your Sub-Components (Partials) ---
import Header from "./components/Header";
import GameControls from "./components/GameControls";
import GameGrid from "./components/GameGrid";
import GameModal from "./components/GameModal"; // If you split the modal too!

// --- Static Constants (Moved outside to prevent re-renders) ---
const DIFFICULTIES = [
  { name: "Easy", count: 10 },
  { name: "Medium", count: 15 },
  { name: "Hard", count: 25 },
  { name: "Pokemon Champion", count: 2500 },
];

const REGIONAL_DEXES = [
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
  { name: "Unova: Black/White", ids: regionalPokedexes.bw },
  { name: "Unova: Black 2/White 2", ids: regionalPokedexes.b2w2 },
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
  { name: "Hisui: Legends:Arceus", ids: regionalPokedexes.la },
  { name: "Paldea: Scarlet & Violet", ids: regionalPokedexes.sv },
];

function App() {
  // --- Game State ---
  const [pokemonList, setPokemonList] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clickedIds, setClickedIds] = useState([]);

  // --- Configuration State ---
  const [requestedCount, setRequestedCount] = useState(12);
  const [idInputStrings, setIdInputStrings] = useState([""]);
  const [numToWin, setNumToWin] = useState(0);

  // --- UI/Status State ---
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictorious, setIsVictorious] = useState(false);
  const [lastClickedName, setLastClickedName] = useState("");

  // --- Logic Helpers ---
  const parseIdInputs = (inputArray) => {
    const pool = new Set();
    inputArray.forEach((str) => {
      const trimmed = str.trim();
      if (!trimmed) return;

      if (trimmed.includes("-")) {
        const [start, end] = trimmed
          .split("-")
          .map((num) => parseInt(num.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let i = min; i <= max; i++) pool.add(i);
        }
      } else {
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

  const squashConsecutive = (ids) => {
    if (ids.length === 0) return [];
    const result = [];
    let start = ids[0];
    let last = ids[0];

    for (let i = 1; i <= ids.length; i++) {
      const current = ids[i];
      if (current && Number(current) === Number(last) + 1) {
        last = current;
      } else {
        result.push(start === last ? `${start}` : `${start}-${last}`);
        start = current;
        last = current;
      }
    }
    return result;
  };

  const getHintForInput = (inputStr) => {
    if (!inputStr) return "";
    const firstId = inputStr.split("-")[0].trim();
    return pokemonNames[firstId] || "";
  };

  // --- Event Handlers ---
  const handleManualInputChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9-]/g, "");
    const newInputs = [...idInputStrings];
    newInputs[index] = cleanValue;

    if (index === idInputStrings.length - 1 && cleanValue.trim() !== "") {
      newInputs.push("");
    }
    setIdInputStrings(newInputs);
  };

  const handleRegionalSelect = (e) => {
    const selectedDex = REGIONAL_DEXES.find(
      (dex) => dex.name === e.target.value,
    );
    if (selectedDex) {
      const squashedRanges = squashConsecutive(selectedDex.ids);
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

  const prepareGame = () => {
    const finalPool = parseIdInputs(idInputStrings);
    if (finalPool.length === 0) {
      alert("Please enter at least one valid Pokémon ID or range!");
      return;
    }
    loadGameWithIds(finalPool);
  };

  const loadGameWithIds = async (finalIdList) => {
    const idsToFetch = getRandomSelection(requestedCount, finalIdList);
    setNumToWin(idsToFetch.length);
    setScore(0);
    setClickedIds([]);
    setIsGameOver(false);
    setIsVictorious(false);

    try {
      const promises = idsToFetch.map(async (id) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error(`Failed to catch ID ${id}`);
        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          image: data.sprites.other["official-artwork"].front_default,
        };
      });
      const results = await Promise.all(promises);
      setPokemonList(results);
    } catch (error) {
      console.error("Error loading Pokémon data:", error);
    }
  };

  const getVictoryMessage = () => {
    if (numToWin >= 1000)
      return `👑 The Very Best! Caught ${numToWin} Pokémon! Gotta catch 'em all!`;
    if (numToWin >= 151)
      return `🏆 Beat Rival Blue! Caught ${numToWin} Pokémon. That's an entire Generation!`;
    if (numToWin >= 50)
      return `🌊 Beat Misty! Caught ${numToWin} Pokémon. Caught any Bug Pokémon?`;
    if (numToWin >= 25)
      return `🚀 Beat Team Rocket! Caught ${numToWin} Pokémon! Prepare for trouble!`;
    if (numToWin >= 15)
      return `🪨 Beat Brock! Bred ${numToWin} Pokémon! Brock on!`;
    return `🩳 Beat Youngster Joey! Caught ${numToWin} Pokémon with their shorts down!`;
  };

  return (
    <div className="App">
      <Header score={score} highScore={highScore} />

      <GameControls
        requestedCount={requestedCount}
        setRequestedCount={setRequestedCount}
        idInputStrings={idInputStrings}
        handleManualInputChange={handleManualInputChange}
        handleRegionalSelect={handleRegionalSelect}
        getHintForInput={getHintForInput}
        prepareGame={prepareGame}
        difficulties={DIFFICULTIES}
        regionalDexes={REGIONAL_DEXES}
        pokemonNames={pokemonNames}
      />

      {numToWin > 0 && (
        <div className="game-status-bar">
          <p>
            Catching <strong>{numToWin}</strong> Pokémon | Progress:{" "}
            <strong>
              {score}/{numToWin}
            </strong>
          </p>
        </div>
      )}

      {isGameOver && (
        <GameModal
          isVictorious={isVictorious}
          lastClickedName={lastClickedName}
          getVictoryMessage={getVictoryMessage}
          onRestart={prepareGame}
        />
      )}

      {/* Actual Game */}
      <GameGrid pokemonList={pokemonList} onCardClick={handleCardClick} />
    </div>
  );
}

export default App;
