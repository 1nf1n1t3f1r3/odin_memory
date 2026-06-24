export default function GameControls({
  requestedCount,
  setRequestedCount,
  idInputStrings,
  handleManualInputChange,
  handleRegionalSelect,
  getHintForInput,
  prepareGame,
  difficulties,
  regionalDexes,
  pokemonNames,
}) {
  return (
    <section className="controls">
      <div className="control-group">
        <div className="setting">
          <label>Difficulty</label>
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
        </div>

        <div className="setting">
          <label>Custom Count</label>
          <input
            type="number"
            value={requestedCount || 0}
            onChange={(e) => setRequestedCount(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="setting">
          <label>Quick Select Region</label>
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
      </div>

      <div className="advanced-controls">
        <details className="manual-details">
          <summary>🛠️ Advanced: Custom ID Entry</summary>
          <p className="help-text">
            Mix and match! Use ranges (1-151) or single IDs (25).
          </p>
          <div className="manual-input-section">
            {idInputStrings.map((str, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  value={str}
                  placeholder="e.g. 1-151"
                  onChange={(e) =>
                    handleManualInputChange(index, e.target.value)
                  }
                />
                <span className="name-hint">{getHintForInput(str)}</span>
              </div>
            ))}
          </div>
        </details>

        <details className="manual-details">
          <summary>📕 National Dex Reference</summary>
          <div className="dex-reference-container">
            <div className="dex-list">
              {Object.entries(pokemonNames).map(([id, name]) => (
                <div key={id} className="dex-item">
                  <span className="dex-id">#{id}</span>
                  <span className="dex-name">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      <button className="start-btn" onClick={prepareGame}>
        I Choose You!
      </button>
    </section>
  );
}
