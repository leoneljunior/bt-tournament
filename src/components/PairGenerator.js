import React from "react";

const PairGenerator = ({ primaryPlayers, secondaryPlayers, setPairs }) => {
  
  const generatePairs = () => {
    let pairs = [];

    if (secondaryPlayers.length > 0) {
      // Two-list scenario
      // Assign a random tiebreaker
      const primaryWithTiebreak = primaryPlayers.map(p => ({ ...p, tiebreak: Math.random() }));
      const secondaryWithTiebreak = secondaryPlayers.map(p => ({ ...p, tiebreak: Math.random() }));

      // Sort by skill, then by tiebreak
      const sortedPrimary = primaryWithTiebreak.sort((a, b) => {
        if (a.skill !== b.skill) return a.skill - b.skill;
        return a.tiebreak - b.tiebreak;
      });

      const sortedSecondary = secondaryWithTiebreak.sort((a, b) => {
        if (a.skill !== b.skill) return a.skill - b.skill;
        return a.tiebreak - b.tiebreak;
      });

      const minLength = Math.min(sortedPrimary.length, sortedSecondary.length);

      // Pair lowest from primary with highest from secondary to balance sums
      let left = 0;
      let right = sortedSecondary.length - 1;

      while (left < minLength && right >= 0) {
        pairs.push([sortedPrimary[left], sortedSecondary[right]]);
        left++;
        right--;
      }

      // Handle remaining primary players if any
      for (let i = left; i < sortedPrimary.length; i++) {
        pairs.push([sortedPrimary[i], { name: "Bye", skill: 0 }]);
      }

      // Handle remaining secondary players if any
      for (let j = right; j >= 0; j--) {
        pairs.push([{ name: "Bye", skill: 0 }, sortedSecondary[j]]);
      }

    } else {
      // Single-list scenario
      const playersWithTiebreak = primaryPlayers.map(p => ({ ...p, tiebreak: Math.random() }));

      // Sort by skill, then tiebreak
      const sorted = playersWithTiebreak.sort((a, b) => {
        if (a.skill !== b.skill) return a.skill - b.skill;
        return a.tiebreak - b.tiebreak;
      });

      // Pair from opposite ends: lowest skill with highest skill
      let left = 0;
      let right = sorted.length - 1;

      while (left <= right) {
        if (left === right) {
          // Odd one out
          pairs.push([sorted[left], { name: "Bye", skill: 0 }]);
        } else {
          pairs.push([sorted[left], sorted[right]]);
        }
        left++;
        right--;
      }
    }

    setPairs(pairs);
  };

  return (
    <div>
      <h2>Generate Pairs</h2>
      <p>
        Pairs are formed to balance skill sums. Players with identical skill levels 
        are randomized, and the highest skill players are paired with the lowest skill 
        players for more balanced total skill sums.
      </p>
      <button onClick={generatePairs}>Create Balanced Pairs</button>
    </div>
  );
};

export default PairGenerator;