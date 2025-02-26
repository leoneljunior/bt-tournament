import React, { useState } from "react";
import NameInput from "./components/NameInput";
import Tournament from "./components/Tournament";
import "./styles/global.css";

const App = () => {
  const [step, setStep] = useState(1);

  const [primaryPlayers, setPrimaryPlayers] = useState([]);
  const [primaryName, setPrimaryName] = useState("");
  const [primarySkill, setPrimarySkill] = useState(5);
  const [primaryBulkNames, setPrimaryBulkNames] = useState("");

  const [pairs, setPairs] = useState([]);
  const [scores, setScores] = useState([]);

  const [pairsGenerated, setPairsGenerated] = useState(false);

  const [groups, setGroups] = useState([]);
  const [groupsCreated, setGroupsCreated] = useState(false);
  const [numGroups, setNumGroups] = useState(2); 

  const goNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1 && step < 5) setStep(step - 1);
  };

  const generatePairs = () => {
    const playersWithTiebreak = primaryPlayers.map(p => ({ ...p, tiebreak: Math.random() }));
    const sorted = playersWithTiebreak.sort((a, b) => 
      (a.skill !== b.skill) ? a.skill - b.skill : a.tiebreak - b.tiebreak
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
  };

  const createGroups = () => {
    const generatedGroups = Array.from({ length: numGroups }, () => []);
    pairs.forEach((pair, index) => {
      generatedGroups[index % numGroups].push(pair);
    });
    setGroups(generatedGroups);
    setGroupsCreated(true);
  };

  return (
    <div className="app-container">
      <h1>Organizador de Torneios BT</h1>
      <div className="steps-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. Adicionar Jogadores</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. Gerar Pares</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3. Criar Grupos</div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>4. Introduzir Resultados</div>
      </div>

      {step === 1 && (
        <div className="step-content">
          <p>Adicione os jogadores e ajuste o nível de habilidade se necessário.</p>
          <div className="flex-container">
            <NameInput
              label="Jogadores"
              playerList={primaryPlayers}
              setPlayerList={setPrimaryPlayers}
              name={primaryName}
              setName={setPrimaryName}
              skill={primarySkill}
              setSkill={setPrimarySkill}
              bulkNames={primaryBulkNames}
              setBulkNames={setPrimaryBulkNames}
            />
          </div>
          {primaryPlayers.length > 0 && (
            <button className="button primary" onClick={goNext}>Avançar</button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>Gerar Pares</h2>
          <p>Clique no botão abaixo para gerar ou regerar pares com base nos níveis de habilidade.</p>
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
              <div style={{ marginTop: "20px" }}>
                <button className="button secondary" onClick={goBack}>Voltar</button>
                <button className="button primary" onClick={goNext}>Avançar</button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <h2>Criar Grupos</h2>
          <p>Defina quantos grupos pretende criar:</p>
          <input
            type="number"
            min="1"
            max={pairs.length}
            value={numGroups}
            onChange={(e) => setNumGroups(Number(e.target.value))}
          />
          <button className="button primary" onClick={createGroups}>
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
              <div style={{ marginTop: "20px" }}>
                <button className="button secondary" onClick={goBack}>Voltar</button>
                <button className="button primary" onClick={goNext}>Avançar</button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="step-content">
          <h2>Introdução de Resultados & Classificações</h2>
          {groups.length > 0 && (
            <>
              <Tournament groups={groups} setScores={setScores} />
              <div style={{ marginTop: "20px" }}>
                <button className="button secondary" onClick={goBack}>Voltar</button>
                <button className="button primary" onClick={goNext}>Concluir</button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="step-content">
          <h2>Torneio Concluído</h2>
          <p>O torneio terminou. Pode iniciar um novo se desejar.</p>
          <button className="button secondary" onClick={() => window.location.reload()}>
            Recomeçar
          </button>
        </div>
      )}
    </div>
  );
};

export default App;