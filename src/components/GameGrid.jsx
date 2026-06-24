export default function GameGrid({ pokemonList, onCardClick }) {
  return (
    <main className="card-container">
      {pokemonList.map((pokemon) => (
        <div
          key={pokemon.id}
          className="card"
          onClick={() => onCardClick(pokemon.id)}
        >
          <div className="card-image-wrapper">
            <img src={pokemon.image} alt={pokemon.name} />
          </div>
          <p className="card-name">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </p>
        </div>
      ))}
    </main>
  );
}
