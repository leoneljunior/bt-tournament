import React, { useState } from "react";

const GroupCreator = ({ pairs, setGroups }) => {
  const [numGroups, setNumGroups] = useState(2);

  const createGroups = () => {
    const groups = Array.from({ length: numGroups }, () => []);
    pairs.forEach((pair, index) => {
      groups[index % numGroups].push(pair);
    });
    setGroups(groups);
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
