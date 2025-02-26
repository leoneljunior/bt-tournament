import React, { useState } from "react";
import "../styles/Tournament.css";

/**
 * Componente para adicionar jogadores, com campo de peso (1-10).
 * Recebe playerList e setPlayerList do componente pai (App.js).
 */
const NameInput = ({ label, playerList, setPlayerList }) => {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState(5);
  const [bulkNames, setBulkNames] = useState("");

  const addPlayer = () => {
    const trimmedName = name.trim();
    if (trimmedName && skill >= 1 && skill <= 10) {
      setPlayerList([...playerList, { name: trimmedName, skill: Number(skill) }]);
      setName("");
      setSkill(5);
    }
  };

  const addBulkPlayers = () => {
    const names = bulkNames
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "");
    if (names.length > 0) {
      // Para jogadores adicionados em massa, podemos definir skill padrão = 5
      const newPlayers = names.map((n) => ({ name: n, skill: 5 }));
      setPlayerList([...playerList, ...newPlayers]);
      setBulkNames("");
    }
  };

  // Handler para editar skill diretamente na lista, caso queira
  const handleSkillChange = (index, newSkill) => {
    const parsed = parseInt(newSkill, 10);
    if (parsed >= 1 && parsed <= 10) {
      const updated = [...playerList];
      updated[index].skill = parsed;
      setPlayerList(updated);
    }
  };

  return (
    <div className="name-input-container">
      <h2 className="heading">{label || "Jogadores"}</h2>
      <p className="description">
        Adicione um jogador com nome e peso (1-10) ou utilize a lista em massa.
      </p>

      <div className="single-add-section">
        <label className="label" htmlFor="single-player-name">
          Nome do Jogador
        </label>
        <input
          id="single-player-name"
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label" htmlFor="single-player-skill">
          Peso (1-10)
        </label>
        <input
          id="single-player-skill"
          className="input"
          type="number"
          min="1"
          max="10"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />

        <button className="button primary" onClick={addPlayer}>
          Adicionar
        </button>
      </div>

      <div className="bulk-add-section">
        <label className="label" htmlFor="bulk-players">
          Adicionar vários nomes (peso = 5)
        </label>
        <textarea
          id="bulk-players"
          className="textarea"
          value={bulkNames}
          onChange={(e) => setBulkNames(e.target.value)}
          placeholder="Ex: Pedro, Maria, Ana"
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
                {" - Peso: "}
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={player.skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  style={{ width: "50px", marginLeft: "5px" }}
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