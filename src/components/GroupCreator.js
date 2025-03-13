import React, { useState } from "react";

const GroupCreator = ({ pairs, setGroups, onGroupsCreated }) => {
  const [numGroups, setNumGroups] = useState(2);

  // Shuffle pairs function (Fisher-Yates)
  const shufflePairs = (pairsArray) => {
    const shuffled = [...pairsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createGroups = () => {
    // Important: create a completely new array to avoid state mutation issues
    const pairsToShuffle = pairs.map(pair => [...pair]);
    const shuffledPairs = shufflePairs(pairsToShuffle);

    const groups = Array.from({ length: numGroups }, () => []);

    shuffledPairs.forEach((pair, index) => {
      groups[index % numGroups].push(pair);
    });

    setGroups(groups);
    if (onGroupsCreated) {
      onGroupsCreated();
    }
  };

  return (
    <div>
      <h2>Group Creation</h2>
      <label>Number of Groups:</label>
      <input
        type="number"
        value={numGroups}
        onChange={(e) => setNumGroups(Number(e.target.value))}
        min="1"
        max={pairs.length}
      />
      <button onClick={createGroups}>Create Groups</button>
    </div>
  );
};

export default GroupCreator;