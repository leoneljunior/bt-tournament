import React, { useState, useEffect } from "react";
import "../styles/Tournament.css";

const Tournament = ({ groups, setScores }) => {
  const [results, setResults] = useState({});
  const [advancingPairs, setAdvancingPairs] = useState([]);

  // Generate all possible matches for a group (round-robin)
  const generateMatches = (group) => {
    const matches = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        matches.push([group[i], group[j]]);
      }
    }
    return matches;
  };

  // Handle score submission
  const handleScoreSubmit = (groupIndex, matchIndex, scorePair1, scorePair2) => {
    const updatedResults = { ...results };
    if (!updatedResults[groupIndex]) updatedResults[groupIndex] = [];
    updatedResults[groupIndex][matchIndex] = [scorePair1, scorePair2];
    setResults(updatedResults);
  };

  // Calculate advancing pairs after scores are entered
  useEffect(() => {
    const calculateAdvancingPairs = () => {
      const advancing = [];
      groups.forEach((group, groupIndex) => {
        const groupResults = results[groupIndex] || [];
        const scores = group.map((pair) => ({
          pair,
          points: 0,
          totalScored: 0,
          totalConceded: 0,
        }));

        // Process results and calculate points, scores, and concessions
        groupResults.forEach((match, matchIndex) => {
          const [score1, score2] = match || [0, 0];
          const [pair1, pair2] = generateMatches(group)[matchIndex];

          const pair1Stats = scores.find((s) => s.pair === pair1);
          const pair2Stats = scores.find((s) => s.pair === pair2);

          // Update scored and conceded points
          pair1Stats.totalScored += score1;
          pair1Stats.totalConceded += score2;
          pair2Stats.totalScored += score2;
          pair2Stats.totalConceded += score1;

          // Update points
          if (score1 > score2) {
            pair1Stats.points += 3; // Win
          } else if (score1 < score2) {
            pair2Stats.points += 3; // Win
          } else {
            pair1Stats.points += 1; // Draw
            pair2Stats.points += 1; // Draw
          }
        });

        // Sort pairs by points and score difference
        const sorted = scores.sort((a, b) => {
          if (b.points === a.points) {
            const aScoreDifference = a.totalScored - a.totalConceded;
            const bScoreDifference = b.totalScored - b.totalConceded;
            return bScoreDifference - aScoreDifference; // Higher score difference wins
          }
          return b.points - a.points; // Higher points win
        });

        // Detect ties for advancing pairs
        const advancingPairs = [];
        let tieDetected = false;

        for (let i = 0; i < sorted.length; i++) {
          if (advancingPairs.length < 2) {
            advancingPairs.push(sorted[i]);
          } else {
            // Check if tie exists for the current pair and the last one in advancing list
            const lastPair = advancingPairs[advancingPairs.length - 1];
            if (
              sorted[i].points === lastPair.points &&
              sorted[i].totalScored - sorted[i].totalConceded ===
                lastPair.totalScored - lastPair.totalConceded
            ) {
              tieDetected = true;
              advancingPairs.push(sorted[i]);
            } else {
              break;
            }
          }
        }

        // Prepare display names
        const finalPairs = advancingPairs.map((pair) => ({
          ...pair,
          displayName:
            pair.pair.join(" & ") +
            (tieDetected ? " [TIE]" : ""),
        }));

        advancing.push(finalPairs.map((p) => p.displayName));
      });

      setAdvancingPairs(advancing);
    };

    calculateAdvancingPairs();
  }, [results, groups]);

  return (
    <div>
      <h2>Tournament Matches</h2>
      {groups.map((group, groupIndex) => {
        const matches = generateMatches(group);
        return (
          <div key={groupIndex}>
            <h3>Group {groupIndex + 1}</h3>
            {matches.map((match, matchIndex) => {
              const [pair1, pair2] = match;
              return (
                <div key={matchIndex}>
                  <p>
                    <table className="match-table">
                        <tbody>
                        <tr>
                            {/* First Pair */}
                            <td>{pair1[0]} & {pair1[1]}</td>
                            {/* Empty cell for spacing */}
                            <td></td>
                            {/* Second Pair */}
                            <td>{pair2[0]} & {pair2[1]}</td>
                        </tr>
                        <tr>
                            {/* Score Pair 1 */}
                            <td>
                            <input
                                type="number"
                                placeholder="Score Pair 1"
                                onBlur={(e) =>
                                handleScoreSubmit(
                                    groupIndex,
                                    matchIndex,
                                    Number(e.target.value),
                                    results[groupIndex]?.[matchIndex]?.[1] || 0
                                )
                                }
                            />
                            </td>
                            {/* "vs" text in the center */}
                            <td>vs</td>
                            {/* Score Pair 2 */}
                            <td>
                            <input
                                type="number"
                                placeholder="Score Pair 2"
                                onBlur={(e) =>
                                handleScoreSubmit(
                                    groupIndex,
                                    matchIndex,
                                    results[groupIndex]?.[matchIndex]?.[0] || 0,
                                    Number(e.target.value)
                                )
                                }
                            />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                   </p>
                </div>
              );
            })}
          </div>
        );
      })}
      <h2>Advancing Pairs</h2>
      {advancingPairs.map((group, index) => (
        <div key={index}>
          <h3>From Group {index + 1}</h3>
          <ul>
            {group.map((pair, pairIndex) => (
              <li key={pairIndex}>{pair}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Tournament;
