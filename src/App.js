import React, { useState } from "react";
import NameInput from "./components/NameInput";
import PairGenerator from "./components/PairGenerator";
import GroupCreator from "./components/GroupCreator";
import Tournament from "./components/Tournament";
import "./styles/global.css"; // Import global styles

const App = () => {
  const [players, setPlayers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [scores, setScores] = useState([]);

  return (
    <div>
      <h1>BT Tournament App</h1>
      <NameInput setPlayers={setPlayers} />
      {players.length > 1 && <PairGenerator players={players} setPairs={setPairs} />}
      {pairs.length > 0 && <GroupCreator pairs={pairs} setGroups={setGroups} />}
      {groups.length > 0 && (
        <Tournament groups={groups} setScores={setScores} />
      )}
    </div>
  );
};

export default App;
