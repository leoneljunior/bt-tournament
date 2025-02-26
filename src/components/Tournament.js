import React, { useState, useEffect } from "react";
import "../styles/Tournament.css";

const Tournament = ({ groups, setScores }) => {
  const [results, setResults] = useState({});
  const [advancingPairs, setAdvancingPairs] = useState([]);

  useEffect(() => {
    // Load stored results from localStorage on mount
    const storedResults = localStorage.getItem("tournamentResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  useEffect(() => {
    // Save results to localStorage whenever they change
    localStorage.setItem("tournamentResults", JSON.stringify(results));
  }, [results]);

  const generateMatches = (group) => {
    const matches = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        matches.push([group[i], group[j]]);
      }
    }
    return matches;
  };

  const handleScoreSubmit = (groupIndex, matchIndex, scorePair1, scorePair2) => {
    const updatedResults = { ...results };
    if (!updatedResults[groupIndex]) updatedResults[groupIndex] = [];
    updatedResults[groupIndex][matchIndex] = [scorePair1, scorePair2];
    setResults(updatedResults);
  };

  useEffect(() => {
    const calculateAdvancingPairs = () => {
      const advancing = [];

      groups.forEach((group, groupIndex) => {
        const groupResults = results[groupIndex] || [];

        const scores = group.map((pair) => {
          const pairKey = pair.map(p => p.name).sort().join("_");
          return {
            pair,
            pairKey,
            points: 0,
            totalScored: 0,
            totalConceded: 0,
            matchesWon: 0,
            matchesPlayed: 0,
            directMatches: {}
          };
        });

        const findStats = (p) => scores.find((s) => s.pair === p);

        const allMatches = generateMatches(group);
        allMatches.forEach((match, matchIndex) => {
          const [score1, score2] = groupResults[matchIndex] || [0, 0];
          const [pair1, pair2] = match;

          const pair1Stats = findStats(pair1);
          const pair2Stats = findStats(pair2);

          pair1Stats.matchesPlayed++;
          pair2Stats.matchesPlayed++;

          pair1Stats.totalScored += score1;
          pair1Stats.totalConceded += score2;
          pair2Stats.totalScored += score2;
          pair2Stats.totalConceded += score1;

          const pair1Key = pair1Stats.pairKey;
          const pair2Key = pair2Stats.pairKey;

          if (!pair1Stats.directMatches[pair2Key]) {
            pair1Stats.directMatches[pair2Key] = { scored: 0, conceded: 0 };
          }
          if (!pair2Stats.directMatches[pair1Key]) {
            pair2Stats.directMatches[pair1Key] = { scored: 0, conceded: 0 };
          }

          pair1Stats.directMatches[pair2Key].scored += score1;
          pair1Stats.directMatches[pair2Key].conceded += score2;

          pair2Stats.directMatches[pair1Key].scored += score2;
          pair2Stats.directMatches[pair1Key].conceded += score1;

          if (score1 > score2) {
            pair1Stats.points += 3;
            pair1Stats.matchesWon++;
          } else if (score1 < score2) {
            pair2Stats.points += 3;
            pair2Stats.matchesWon++;
          } else {
            pair1Stats.points += 1;
            pair2Stats.points += 1;
          }
        });

        const sorted = scores.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;

          const tiedWithSamePoints = scores.filter((s) => s.points === a.points);
          if (tiedWithSamePoints.length === 2) {
            const aDirect = a.directMatches[b.pairKey] || { scored: 0, conceded: 0 };
            const bDirect = b.directMatches[a.pairKey] || { scored: 0, conceded: 0 };
            if (aDirect.scored > aDirect.conceded) return -1; 
            if (bDirect.scored > bDirect.conceded) return 1;  
          }

          const aDiff = a.totalScored - a.totalConceded;
          const bDiff = b.totalScored - b.totalConceded;
          if (bDiff !== aDiff) return bDiff - aDiff;

          const aGameAverage = a.totalScored / (a.matchesPlayed || 1);
          const bGameAverage = b.totalScored / (b.matchesPlayed || 1);
          if (bGameAverage !== aGameAverage) return bGameAverage - aGameAverage;

          return 0;
        });

        const advancingPairsGroup = [];
        let tieDetected = false;

        for (let i = 0; i < sorted.length; i++) {
          if (advancingPairsGroup.length < 2) {
            advancingPairsGroup.push(sorted[i]);
          } else {
            const lastPair = advancingPairsGroup[advancingPairsGroup.length - 1];
            if (
              sorted[i].points === lastPair.points &&
              sorted[i].matchesWon === lastPair.matchesWon &&
              (sorted[i].totalScored - sorted[i].totalConceded) === (lastPair.totalScored - lastPair.totalConceded) &&
              (sorted[i].totalScored / (sorted[i].matchesPlayed || 1)) === (lastPair.totalScored / (lastPair.matchesPlayed || 1))
            ) {
              tieDetected = true;
              advancingPairsGroup.push(sorted[i]);
            } else {
              break;
            }
          }
        }

        const finalPairs = advancingPairsGroup.map((p) => {
          const displayName = p.pair.map(pl => pl.name).join(" & ") + (tieDetected ? " [TIE]" : "");
          return displayName;
        });

        advancing.push(finalPairs);
      });

      setAdvancingPairs(advancing);
    };

    calculateAdvancingPairs();
  }, [results, groups]);

  const allMatchesStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px"
  };

  const matchCardStyle = {
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
    padding: "15px",
    width: "300px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  const matchTopStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  };

  const pairColumnStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: "1"
  };

  const pairNameStyle = {
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: "5px",
    textAlign: "center"
  };

  const scoreInputStyle = {
    width: "60px",
    padding: "5px",
    textAlign: "center",
    marginTop: "5px"
  };

  const vsTextStyle = {
    margin: "0 10px",
    fontWeight: "bold",
    fontSize: "1.2rem"
  };

  return (
    <div>
      <h2>Tournament Matches</h2>
      {groups.map((group, groupIndex) => {
        const matches = generateMatches(group);
        return (
          <div key={groupIndex}>
            <h3>Group {groupIndex + 1}</h3>
            <div style={allMatchesStyle}>
              {matches.map((match, matchIndex) => {
                const [pair1, pair2] = match;
                const currentScores = results[groupIndex]?.[matchIndex] || [0, 0];

                return (
                  <div key={matchIndex} style={matchCardStyle}>
                    <div style={matchTopStyle}>
                      <div style={pairColumnStyle}>
                        <div style={pairNameStyle}>{pair1.map(p => p.name).join(" & ")}</div>
                        <input
                          type="number"
                          placeholder="Score"
                          value={currentScores[0]}
                          style={scoreInputStyle}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleScoreSubmit(groupIndex, matchIndex, val, currentScores[1]);
                          }}
                        />
                      </div>

                      <div style={vsTextStyle}>vs</div>

                      <div style={pairColumnStyle}>
                        <div style={pairNameStyle}>{pair2.map(p => p.name).join(" & ")}</div>
                        <input
                          type="number"
                          placeholder="Score"
                          value={currentScores[1]}
                          style={scoreInputStyle}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleScoreSubmit(groupIndex, matchIndex, currentScores[0], val);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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