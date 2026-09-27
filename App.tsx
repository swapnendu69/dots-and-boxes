import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import { GameMode, Player } from './types';

const App: React.FC = () => {
  const [isGameActive, setGameActive] = useState(false);
  const [config, setConfig] = useState<{
    gridSize: number;
    players: Player[];
    mode: GameMode;
  } | null>(null);

  const handleStart = (gridSize: number, players: Player[], mode: GameMode) => {
    setConfig({ gridSize, players, mode });
    setGameActive(true);
  };

  const handleExit = () => {
    setGameActive(false);
    setConfig(null);
  };

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {isGameActive && config ? (
        <GameScreen 
          gridSize={config.gridSize} 
          players={config.players} 
          mode={config.mode}
          onExit={handleExit}
        />
      ) : (
        <SetupScreen onStart={handleStart} />
      )}
    </div>
  );
};

export default App;
