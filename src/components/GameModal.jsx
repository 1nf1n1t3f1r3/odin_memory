export default function GameModal({
  isVictorious,
  lastClickedName,
  getVictoryMessage,
  onRestart,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        {isVictorious ? (
          <div className="victory-content">
            <h2>{getVictoryMessage()}</h2>
            <button className="start-btn" onClick={onRestart}>
              Play Again?
            </button>
          </div>
        ) : (
          <div className="defeat-content">
            <h2>Hey, don't be a thief!</h2>
            <p>
              You already caught{" "}
              <strong>{lastClickedName.toUpperCase()}</strong>!
            </p>
            <button className="start-btn" onClick={onRestart}>
              Try Again?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
