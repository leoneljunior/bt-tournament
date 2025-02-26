import React, { useState, useEffect } from "react";
import NameInput from "./components/NameInput";
import Tournament from "./components/Tournament";
import "./styles/global.css";

const LOCAL_STORAGE_KEY = "torneios";

const App = () => {
  const [step, setStep] = useState(0); // 0 = Selecionar/Criar Torneio

  const [torneios, setTorneios] = useState({});
  const [currentTournament, setCurrentTournament] = useState("");

  // Dados do torneio atual
  const [players, setPlayers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [scores, setScores] = useState({});

  const [pairsGenerated, setPairsGenerated] = useState(false);
  const [groupsCreated, setGroupsCreated] = useState(false);

  // Número de grupos
  const [numGroups, setNumGroups] = useState(2);

  // Carrega torneios do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setTorneios(JSON.parse(stored)); 
    }
  }, []);

  // Sempre que `torneios` mudar, salva em localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(torneios));
  }, [torneios]);

  // Determina em qual passo devemos entrar, de acordo com os dados já existentes
  const determineStepFromData = (data) => {
    // Se já existem groups, pulamos diretamente ao passo 4 (ver resultados)
    if (data.groups && data.groups.length > 0) {
      return 4;
    }
    // Se já existem pairs, mas não groups, então passo 3
    if (data.pairs && data.pairs.length > 0) {
      return 3;
    }
    // Se só existem players, então passo 2
    if (data.players && data.players.length > 0) {
      return 2;
    }
    // Caso contrário, passo 1
    return 1;
  };

  // Seleciona ou cria torneio
  const handleSelectTorneio = (nomeTorneio) => {
    setCurrentTournament(nomeTorneio);

    // Se o torneio não existe, cria
    if (!torneios[nomeTorneio]) {
      const novo = {
        players: [],
        pairs: [],
        groups: [],
        scores: {}
      };
      setTorneios((prev) => ({ ...prev, [nomeTorneio]: novo }));
      
      // Limpa estados locais
      setPlayers([]);
      setPairs([]);
      setGroups([]);
      setScores({});
      setPairsGenerated(false);
      setGroupsCreated(false);
      setStep(1);
    } else {
      // Se existe, carrega dados
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

  // Salvar dados do torneio atual no estado "torneios"
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

  // Sempre que players mudar (no passo 1), salva e reseta flags
  useEffect(() => {
    if (step === 1 && currentTournament) {
      saveCurrentTournamentData({ players });
      // Se mudar a lista de players, pares e grupos já não são mais válidos
      setPairsGenerated(false);
      setGroupsCreated(false);
    }
  }, [players, step]);

  // Navegação
  const goNext = () => setStep((prev) => prev + 1);
  const goBack = () => step > 0 && setStep((prev) => prev - 1);

  // Gera ou regera pares
  const generatePairs = () => {
    const playersWithTiebreak = players.map((p) => ({
      ...p,
      tiebreak: Math.random(),
    }));
    // Ordenar por peso (skill) e depois por tiebreak
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
    // Salva no torneio
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

  return (
    <div className="app-container">
      <h1>Organizador de Torneios BT</h1>
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
          <h2>Criar ou Selecionar Torneio</h2>
          <p>Selecione um torneio existente ou crie um novo.</p>

          {Object.keys(torneios).length === 0 && <div><em>Nenhum torneio guardado.</em></div>}

          <ul>
            {Object.keys(torneios).map((tName) => (
              <li key={tName} style={{ margin: "5px 0" }}>
                <button className="button secondary" onClick={() => handleSelectTorneio(tName)}>
                  {tName}
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "20px" }}>
            <label htmlFor="newTournamentName">Novo Torneio:</label><br />
            <input
              id="newTournamentName"
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

      {/* ========== Passo 1 - Adicionar Jogadores (com peso) ========== */}
      {step === 1 && currentTournament && (
        <div className="step-content">
          <h2>Torneio: {currentTournament}</h2>
          <p>Adicione os jogadores e ajuste o peso (1-10) se necessário.</p>
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

      {/* ========== Passo 2 - Gerar Pares ========== */}
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

      {/* ========== Passo 3 - Criar Grupos ========== */}
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
                onChange={(e) => setNumGroups(Number(e.target.value))}
              />
              <button className="button primary" onClick={createGroupsAutomatically}>
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

      {/* ========== Passo 4 - Introduzir / Ver Resultados ========== */}
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

      {/* ========== Passo 5 - Concluído ========== */}
      {step === 5 && (
        <div className="step-content">
          <h2>Torneio Concluído</h2>
          <p>O torneio terminou. Pode selecionar outro ou criar um novo no Passo 0.</p>
          <button className="button secondary" onClick={() => setStep(0)}>
            Voltar ao Início
          </button>
        </div>
      )}
    </div>
  );
};

export default App;