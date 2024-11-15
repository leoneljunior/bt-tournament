import React, { useState } from "react";

const NameInput = ({ setPlayers }) => {
  const [name, setName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [playerList, setPlayerList] = useState([]);

  const addPlayer = () => {
    if (name.trim()) {
      setPlayerList([...playerList, name.trim()]);
      setName("");
    }
  };

  const addBulkPlayers = () => {
    const names = bulkNames.split(",").map((n) => n.trim());
    setPlayerList([...playerList, ...names]);
    setBulkNames("");
  };

  const finalizePlayers = () => {
    setPlayers(playerList);
  };

  return (
    <div>
      <h2>Enter Player Names</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter player name"
      />
      <button onClick={addPlayer}>Add Player</button>
      <br />
      <textarea
        value={bulkNames}
        onChange={(e) => setBulkNames(e.target.value)}
        placeholder="Enter names separated by commas"
        rows="3"
      />
      <button onClick={addBulkPlayers}>Add Bulk Players</button>
      <br />
      <button onClick={finalizePlayers}>Finalize</button>
      <ul>
        {playerList.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
    </div>
  );
};

export default NameInput;
