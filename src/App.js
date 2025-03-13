import React, { useState, useEffect } from "react";
import NameInput from "./components/NameInput";
import Tournament from "./components/Tournament";
import "./styles/global.css";

const LOCAL_STORAGE_KEY = "torneios";

const App = () => {
  const [step, setStep] = useState(0); 
  const [torneios, setTorneios] = useState({});
  const [currentTournament, setCurrentTournament] = useState("");

  const [players, setPlayers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [scores, setScores] = useState({});

  const [pairsGenerated, setPairsGenerated] = useState(false);
  const [groupsCreated, setGroupsCreated] = useState(false);
  const [numGroups, setNumGroups] = useState(2);

  const [showModal, setShowModal] = useState(false);
  const [modalTournamentName, setModalTournamentName] = useState("");

  // New states for pairing mode and manual pair input
  // "random" means the app will generate pairs from the players list
  // "manual" means the user will input the pairs directly
  const [pairingMode, setPairingMode] = useState("random");
  const [manualName1, setManualName1] = useState("");
  const [manualName2, setManualName2] = useState("");
  const [manualPairList, setManualPairList] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setTorneios(JSON.parse(stored)); 
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(torneios));
  }, [torneios]);

  const determineStepFromData = (data) => {
    if (data.groups && data.groups.length > 0) {
      return 3;
    }
    if (data.pairs && data.pairs.length > 0) {
      return 1;
    }
    if (data.players && data.players.length > 0) {
      return 1;
    }
    return 0;
  };

  const handleSelectTorneio = (nomeTorneio) => {
    setCurrentTournament(nomeTorneio);

    if (!torneios[nomeTorneio]) {
      const novo = {
        players: [],
        pairs: [],
        groups: [],
        scores: {}
      };
      setTorneios((prev) => ({ ...prev, [nomeTorneio]: novo }));
      
      setPlayers([]);
      setPairs([]);
      setGroups([]);
      setScores({});
      setPairsGenerated(false);
      setGroupsCreated(false);
      setStep(1);
    } else {
      const data = torneios[nomeTorneio];
      setPlayers(data.players || []);
      setPairs(data.pairs || []);
      setGroups(data.groups || []);
      setScores(data.scores || {});
      setPairsGenerated(!!(data.pairs && data.pairs.length > 0));
      setGroupsCreated(!!(data.groups && data.groups.length > 0));

      const nextStep = determineStepFromData(data);
      setStep(nextStep);
    }
  };

  /** Removes a tournament from localStorage/state */
  const handleRemoveTournament = (nomeTorneio) => {
    const updated = { ...torneios };
    delete updated[nomeTorneio];
    setTorneios(updated);
    if (currentTournament === nomeTorneio) {
      setCurrentTournament("");
      setStep(0);
    }
  };

  const handleOpenTournamentModal = (tName) => {
    setModalTournamentName(tName);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalTournamentName("");
  };

  const saveCurrentTournamentData = (updates) => {
    if (!currentTournament) return;
    setTorneios((prev) => ({
      ...prev,
      [currentTournament]: {
        ...prev[currentTournament],
        ...updates,
      },
    }));
  };

  useEffect(() => {
    if (step === 0 && currentTournament) {
      saveCurrentTournamentData({ players });
      setPairsGenerated(false);
      setGroupsCreated(false);
    }
  }, [players, step]);

  const goNext = () => setStep((prev) => prev + 1);
  const goBack = () => step > 0 && setStep((prev) => prev - 1);

  const generatePairs = () => {
    const playersWithTiebreak = players.map((p) => ({
      ...p,
      tiebreak: Math.random(),
    }));
    const sorted = playersWithTiebreak.sort((a, b) =>
      a.skill !== b.skill ? a.skill - b.skill : a.tiebreak - b.tiebreak
    );

    const newPairs = [];
    let left = 0;
    let right = sorted.length - 1;
    while (left <= right) {
      if (left === right) {
        newPairs.push([sorted[left], { name: "Bye", skill: 0 }]);
      } else {
        newPairs.push([sorted[left], sorted[right]]);
      }
      left++;
      right--;
    }

    setPairs(newPairs);
    setPairsGenerated(true);
    saveCurrentTournamentData({ pairs: newPairs });
  };

  // New functions for manual pair input
  const addManualPair = () => {
    const name1 = manualName1.trim();
    const name2 = manualName2.trim();
    if (name1 && name2) {
      const newPair = [{ name: name1, skill: 5 }, { name: name2, skill: 5 }];
      const updatedPairs = [...pairs, newPair];
      setPairs(updatedPairs);
      saveCurrentTournamentData({ pairs: updatedPairs });
      setManualName1("");
      setManualName2("");
      setPairsGenerated(true);
    }
  };

  const addManualPairList = () => {
    const list = manualPairList.trim();
    if (list) {
      const pairStrings = list.split(",").map(s => s.trim()).filter(s => s);
      const newPairs = pairStrings.map(pairStr => {
        const [p1, p2] = pairStr.split("/").map(s => s.trim());
        return [{ name: p1, skill: 5 }, { name: p2, skill: 5 }];
      });
      const updatedPairs = [...pairs, ...newPairs];
      setPairs(updatedPairs);
      saveCurrentTournamentData({ pairs: updatedPairs });
      setManualPairList("");
      setPairsGenerated(true);
    }
  };

  // 🔴 AQUI ESTÁ A CORREÇÃO: embaralhar as duplas antes de criar os grupos.
  const createGroupsAutomatically = () => {
    const shuffledPairs = [...pairs];

    // Fisher-Yates shuffle
    for (let i = shuffledPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPairs[i], shuffledPairs[j]] = [shuffledPairs[j], shuffledPairs[i]];
    }

    const generatedGroups = Array.from({ length: numGroups }, () => []);
    shuffledPairs.forEach((pair, index) => {
      generatedGroups[index % numGroups].push(pair);
    });
    setGroups(generatedGroups);
    setGroupsCreated(true);

    saveCurrentTournamentData({ groups: generatedGroups });
  };

  const getTournamentGroups = (tName) => {
    const tData = torneios[tName];
    if (!tData || !tData.groups) return [];
    return tData.groups;
  };

  return (
    <div className="app-container">
      <h1>Organizador de Torneios BT</h1>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-tournament-title">{modalTournamentName}</h2>
            <p>Grupos e duplas:</p>

            <div className="modal-groups-container">
              {getTournamentGroups(modalTournamentName).length === 0 && (
                <p><em>Nenhum grupo criado para este torneio.</em></p>
              )}

              {getTournamentGroups(modalTournamentName).map((group, idx) => (
                <div className="group-card" key={idx}>
                  <h3>Grupo {idx + 1}</h3>
                  <ul>
                    {group.map((pair, i) => (
                      <li key={i}>{pair.map(p => p.name).join(" & ")}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button className="button primary" onClick={closeModal}>Fechar</button>
          </div>
        </div>
      )}

      <div className="steps-indicator">
        <div className={`step ${step >= 0 ? "active" : ""}`}>0. Selecionar/Criar Torneio</div>
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. Adicionar Duplas</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. Criar Grupos</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3. Resultados</div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>4. Torneio Concluído</div>
      </div>

      {/* ========== Passo 0 - Selecionar/Criar Torneio ========== */}
      {step === 0 && (
        <div className="step-content">
          <h2 className="tournament-selection-title">Criar ou Selecionar Torneio</h2>
          <p>Veja grupos ou crie um novo torneio.</p>

          {Object.keys(torneios).length === 0 && (
            <div><em>Nenhum torneio guardado.</em></div>
          )}

          <ul>
            {Object.keys(torneios).map((tName) => (
              <li key={tName} style={{ margin: "10px 0" }}>
                <span className="tournament-name-highlight">{tName}</span>

                <button 
                  className="button info" 
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleOpenTournamentModal(tName)}
                >
                  Ver Grupos
                </button>

                <button 
                  className="button remove"
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleRemoveTournament(tName)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "30px" }}>
            <label htmlFor="newTournamentName">Novo Torneio:</label><br />
            <input
              id="newTournamentName"
              className="input"
              type="text"
              placeholder="Nome do Torneio"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.target.value.trim();
                  if (val) handleSelectTorneio(val);
                }
              }}
            />
            <button
              className="button primary"
              style={{ marginLeft: "10px" }}
              onClick={() => {
                const input = document.getElementById("newTournamentName");
                if (input) {
                  const val = input.value.trim();
                  if (val) {
                    handleSelectTorneio(val);
                  }
                }
              }}
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {/* ========== Passo 1 - Adicionar Duplas (seleção de modo) ========== */}
      {step === 1 && currentTournament && (
        <div className="step-content">
          <h2>Torneio: {currentTournament}</h2>
          <div style={{ marginBottom: "20px" }}>
            <button
              className={pairingMode === "random" ? "button primary" : "button secondary"}
              onClick={() => setPairingMode("random")}
              style={{ marginRight: "10px" }}
            >
              Duplas Sorteadas
            </button>
            <button
              className={pairingMode === "manual" ? "button primary" : "button secondary"}
              onClick={() => setPairingMode("manual")}
            >
              Duplas Formadas
            </button>
          </div>
          {pairingMode === "random" ? (
            <>
              <p>Adicione os jogadores (peso 1-10):</p>
              <div className="flex-container">
                <NameInput label="Jogadores" playerList={players} setPlayerList={setPlayers} />
              </div>
              {players.length > 0 && (
                <>
                  <button className="button primary" onClick={generatePairs}>
                    {pairsGenerated ? "Regerar Pares" : "Gerar Pares"}
                  </button>
                  {pairsGenerated && (
                    <>
                      <h3>Pares Gerados</h3>
                      <table className="pairs-table">
                        <thead>
                          <tr><th>Par</th></tr>
                        </thead>
                        <tbody>
                          {pairs.map((pair, i) => (
                            <tr key={i}>
                              <td>{pair.map(p => p.name).join(" & ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {pairsGenerated && (
                    <button className="button primary" onClick={goNext}>
                      Avançar
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <h3>Adicionar Duplas Formadas</h3>
              <div>
                <input
                  type="text"
                  placeholder="Nome do Jogador 1"
                  value={manualName1}
                  onChange={(e) => setManualName1(e.target.value)}
                  className="input"
                  style={{ marginRight: "10px" }}
                />
                <input
                  type="text"
                  placeholder="Nome do Jogador 2"
                  value={manualName2}
                  onChange={(e) => setManualName2(e.target.value)}
                  className="input"
                />
                <button className="button primary" onClick={addManualPair} style={{ marginLeft: "10px" }}>
                  Adicionar Dupla
                </button>
              </div>
              <div style={{ marginTop: "20px" }}>
                <textarea
                  placeholder='Ex: "Leonel/Douglas, Davi/Marcos"'
                  value={manualPairList}
                  onChange={(e) => setManualPairList(e.target.value)}
                  className="textarea"
                  rows="3"
                />
                <button className="button primary" onClick={addManualPairList} style={{ marginLeft: "10px", marginTop: "10px" }}>
                  Adicionar Lista de Duplas
                </button>
              </div>
              {pairs.length > 0 && (
                <>
                  <h3>Duplas Formadas</h3>
                  <table className="pairs-table">
                    <thead>
                      <tr><th>Dupla</th></tr>
                    </thead>
                    <tbody>
                      {pairs.map((pair, i) => (
                        <tr key={i}>
                          <td>{pair.map(p => p.name).join(" & ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="button primary" onClick={goNext}>
                    Avançar
                  </button>
                </>
              )}
            </>
          )}
          <button className="button secondary" onClick={goBack}>Voltar</button>
        </div>
      )}

      {/* ========== Passo 2 - Criar Grupos ========== */}
      {step === 2 && (
        <div className="step-content">
          <h2>Criar Grupos</h2>
          {pairs.length === 0 ? (
            <p><em>Nenhum par gerado.</em></p>
          ) : (
            <>
              <label>Quantos grupos?</label><br />
              <input
                type="number"
                min="1"
                max={pairs.length}
                value={numGroups}
                className="input"
                onChange={(e) => setNumGroups(Number(e.target.value))}
              />
              <button 
                className="button primary" 
                style={{ marginLeft: "10px" }}
                onClick={createGroupsAutomatically}
              >
                Criar Grupos
              </button>

              {groupsCreated && (
                <>
                  {groups.map((group, i) => (
                    <div key={i}>
                      <h3>Grupo {i + 1}</h3>
                      <ul>
                        {group.map((pair, j) => (
                          <li key={j}>{pair.map(p => p.name).join(" & ")}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          <div style={{ marginTop: "20px" }}>
            <button className="button secondary" onClick={goBack}>Voltar</button>
            {groupsCreated && (
              <button className="button primary" onClick={goNext}>
                Avançar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========== Passo 3 - Resultados ========== */}
      {step === 3 && (
        <div className="step-content">
          <h2>Resultados do Torneio</h2>
          {groups.length > 0 ? (
            <>
              <Tournament
                groups={groups}
                currentTournament={currentTournament}
                torneios={torneios}
                setTorneios={setTorneios}
              />
            </>
          ) : (
            <p><em>Nenhum grupo criado.</em></p>
          )}
          <div style={{ marginTop: "20px" }}>
            <button className="button secondary" onClick={goBack}>Voltar</button>
            <button className="button primary" onClick={() => setStep(4)}>Concluir</button>
          </div>
        </div>
      )}

      {/* ========== Passo 4 - Torneio Concluído ========== */}
      {step === 4 && (
        <div className="step-content">
          <h2>Torneio Concluído</h2>
          <p>O torneio terminou. Pode selecionar ou criar outro torneio.</p>
          <button className="button secondary" onClick={() => setStep(0)}>
            Voltar ao Início
          </button>
        </div>
      )}
    </div>
  );
};

export default App;