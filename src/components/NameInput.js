import React from "react";
import "../styles/Tournament.css";

const NameInput = ({
  label,
  playerList,
  setPlayerList,
  name,
  setName,
  skill,
  setSkill,
  bulkNames,
  setBulkNames
}) => {

  const addPlayer = () => {
    const trimmedName = name.trim();
    if (trimmedName && skill >= 1 && skill <= 10) {
      setPlayerList([...playerList, { name: trimmedName, skill: Number(skill) }]);
      setName("");
      setSkill(5);
    }
  };

  const addBulkPlayers = () => {
    const namesArray = bulkNames
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    if (namesArray.length > 0) {
      const newPlayers = namesArray.map((n) => ({ name: n, skill: 5 }));
      setPlayerList([...playerList, ...newPlayers]);
      setBulkNames("");
    }
  };

  return (
    <div className="name-input-container">
      <h2 className="heading">{label || "Adicione Nomes dos Jogadores"}</h2>
      <p className="description">
        Adicione um jogador com nome e nível de habilidade (1-10) ou cole uma lista de nomes (habilidade padrão 5).
        Após adicionar, você pode alterar o nível de habilidade antes de prosseguir.
      </p>

      <div className="single-add-section">
        <label className="label" htmlFor="single-player-name">
          Nome do jogador:
        </label>
        <input
          id="single-player-name"
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João"
        />

        <label className="label" htmlFor="single-player-skill">
          Nível de habilidade (1-10):
        </label>
        <input
          id="single-player-skill"
          className="input"
          type="number"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          min={1}
          max={10}
        />

        <button className="button primary" onClick={addPlayer}>
          Adicionar
        </button>
      </div>

      <div className="bulk-add-section">
        <label className="label" htmlFor="bulk-players">
          Adicionar vários jogadores (nome apenas, habilidade padrão = 5):
        </label>
        <textarea
          id="bulk-players"
          className="textarea"
          value={bulkNames}
          onChange={(e) => setBulkNames(e.target.value)}
          placeholder="Exemplo: João, Maria, Carlos, Ana"
          rows="3"
        />
        <button className="button secondary" onClick={addBulkPlayers}>
          Adicionar Lista
        </button>
      </div>

      {playerList.length > 0 && (
        <div className="player-list-section">
          <h3 className="subheading">Jogadores Adicionados:</h3>
          <ul className="player-list">
            {playerList.map((player, index) => (
              <li className="player-item" key={index}>
                <strong>{player.name}</strong>
                <span style={{ margin: "0 10px" }}>Skill:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={player.skill}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val >= 1 && val <= 10) {
                      const updated = [...playerList];
                      updated[index].skill = val;
                      setPlayerList(updated);
                    }
                  }}
                  style={{ width: "50px" }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NameInput;