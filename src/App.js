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
      return 4;
    }
    if (data.pairs && data.pairs.length > 0) {
      return 3;
    }
    if (data.players && data.players.length > 0) {
      return 2;
    }
    return 1;
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
    if (step === 1 && currentTournament) {
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

  const createGroupsAutomatically = () => {
    const generatedGroups = Array.from({ length: numGroups }, () => []);
    pairs.forEach((pair, index) => {
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
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. Adicionar Jogadores</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. Gerar Pares</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3. Criar Grupos</div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>4. Resultados</div>
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

      {/* ========== Restante do fluxo de passos 1..4 ========== */}
      {step === 1 && currentTournament && (
        <div className="step-content">
          <h2>Torneio: {currentTournament}</h2>
          <p>Adicione os jogadores (peso 1-10).</p>
          <div className="flex-container">
            <NameInput
              label="Jogadores"
              playerList={players}
              setPlayerList={setPlayers}
            />
          </div>

          {players.length > 0 && (
            <button className="button primary" onClick={goNext}>Avançar</button>
          )}
          <button className="button secondary" onClick={goBack}>Voltar</button>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>Gerar Pares</h2>
          {players.length === 0 ? (
            <p><em>Nenhum jogador adicionado.</em></p>
          ) : (
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
            </>
          )}
          <div style={{ marginTop: "20px" }}>
            <button className="button secondary" onClick={goBack}>Voltar</button>
            {pairsGenerated && (
              <button className="button primary" onClick={goNext}>
                Avançar
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
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

      {step === 4 && (
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
            <button className="button primary" onClick={() => setStep(5)}>Concluir</button>
          </div>
        </div>
      )}

      {step === 5 && (
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