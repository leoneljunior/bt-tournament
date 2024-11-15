import React from "react";

const PairGenerator = ({ players, setPairs }) => {
  const generatePairs = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const pairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      pairs.push([shuffled[i], shuffled[i + 1] || "Bye"]);
    }
    setPairs(pairs);
  };

  return (
    <div>
      <h2>Generate Pairs</h2>
      <button onClick={generatePairs}>Create Random Pairs</button>
    </div>
  );
};

export default PairGenerator;
