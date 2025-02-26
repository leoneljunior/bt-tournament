import React, { useEffect, useState } from "react";
import "../styles/Tournament.css";

/**
 * @param {Array} groups - Grupos [ [par1, par2], [par3, par4], ... ]
 * @param {String} currentTournament - Nome do torneio
 * @param {Object} torneios - Objeto com todos os torneios armazenados (no localStorage)
 * @param {Function} setTorneios - Para atualizar e salvar no localStorage
 */
const Tournament = ({ groups, currentTournament, torneios, setTorneios }) => {
  const [advancingPairs, setAdvancingPairs] = useState([]);

  // Obtem scores do torneio atual
  const tournamentData = torneios[currentTournament] || {};
  const results = tournamentData.scores || {};

  // Salvar results no objeto do torneio
  const saveResults = (newResults) => {
    setTorneios((prev) => ({
      ...prev,
      [currentTournament]: {
        ...prev[currentTournament],
        scores: newResults,
      },
    }));
  };

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
    if (!updatedResults[groupIndex]) {
      updatedResults[groupIndex] = [];
    }
    updatedResults[groupIndex][matchIndex] = [scorePair1, scorePair2];
    saveResults(updatedResults);
  };

  useEffect(() => {
    const calculateAdvancingPairs = () => {
      const advancing = [];

      groups.forEach((group, groupIndex) => {
        const groupResults = results[groupIndex] || [];

        const scoresArray = group.map((pair) => {
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

        const findStats = (p) => scoresArray.find((s) => s.pair === p);

        const allMatches = generateMatches(group);
        allMatches.forEach((match, matchIndex) => {
          const [score1, score2] = groupResults[matchIndex] || [0, 0];
          const [pair1, pair2] = match;

          const pair1Stats = findStats(pair1);
          const pair2Stats = findStats(pair2);

          // Atualiza stats...
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

          // Pontos
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

        // Ordenação
        const sorted = scoresArray.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;

          // Se exatamente dois empatados, confronto direto
          const tiedWithSamePoints = scoresArray.filter((s) => s.points === a.points);
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

        // Seleciona quem avança (exemplo: 2 primeiros)
        const advancingPairsGroup = [];
        let tieDetected = false;
        for (let i = 0; i < sorted.length; i++) {
          if (advancingPairsGroup.length < 2) {
            advancingPairsGroup.push(sorted[i]);
          } else {
            const last = advancingPairsGroup[advancingPairsGroup.length - 1];
            if (
              sorted[i].points === last.points &&
              sorted[i].matchesWon === last.matchesWon &&
              (sorted[i].totalScored - sorted[i].totalConceded) === 
                (last.totalScored - last.totalConceded) &&
              (sorted[i].totalScored / (sorted[i].matchesPlayed || 1)) === 
                (last.totalScored / (last.matchesPlayed || 1))
            ) {
              tieDetected = true;
              advancingPairsGroup.push(sorted[i]);
            } else {
              break;
            }
          }
        }

        const finalPairs = advancingPairsGroup.map((p) => {
          const displayName = p.pair.map(pl => pl.name).join(" & ")
            + (tieDetected ? " [TIE]" : "");
          return displayName;
        });

        advancing.push(finalPairs);
      });

      setAdvancingPairs(advancing);
    };

    calculateAdvancingPairs();
  }, [results, groups]);

  // Estilos inline
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
      <h2>Partidas do Torneio</h2>
      {groups.map((group, groupIndex) => {
        const matches = generateMatches(group);
        return (
          <div key={groupIndex}>
            <h3>Grupo {groupIndex + 1}</h3>
            <div style={allMatchesStyle}>
              {matches.map((match, matchIndex) => {
                const [pair1, pair2] = match;
                // Se não houver pontuações, default = [0,0]
                const groupScores = results[groupIndex] || [];
                const currentScores = groupScores[matchIndex] || [0, 0];

                return (
                  <div key={matchIndex} style={matchCardStyle}>
                    <div style={matchTopStyle}>
                      <div style={pairColumnStyle}>
                        <div style={pairNameStyle}>
                          {pair1.map(p => p.name).join(" & ")}
                        </div>
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
                        <div style={pairNameStyle}>
                          {pair2.map(p => p.name).join(" & ")}
                        </div>
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

      <h2>Pares que Avançam</h2>
      {advancingPairs.map((group, index) => (
        <div key={index}>
          <h3>Grupo {index + 1}</h3>
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