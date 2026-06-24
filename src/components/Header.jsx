export default function Header({ score, highScore }) {
  return (
    <header className="header">
      <h1>Pokémon Memory Game</h1>
      <div className="scoreboard">
        <div className="score-badge">
          Current Score: <span>{score}</span>
        </div>
        <div className="score-badge high">
          Best Score: <span>{highScore}</span>
        </div>
      </div>
    </header>
  );
}
