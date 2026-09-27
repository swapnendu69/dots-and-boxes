import React, { useState } from 'react';
import { GameMode, Player } from '../types';
import { GRID_SIZES, PLAYER_COLORS } from '../constants';
import Button from './Button';

interface SetupScreenProps {
  onStart: (gridSize: number, players: Player[], mode: GameMode) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [mode, setMode] = useState<GameMode>(GameMode.VS_CPU);
  const [gridSize, setGridSize] = useState<number>(4);
  const [playerCount, setPlayerCount] = useState<number>(2);

  // Local state for player initials (up to 10 players)
  const [customInitials, setCustomInitials] = useState<string[]>([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
  ]);

  const handleInitialChange = (index: number, value: string) => {
    const updated = [...customInitials];
    updated[index] = value.toUpperCase().slice(0, 1);
    setCustomInitials(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Online multiplayer is coming soon - do not start game
    if (mode === GameMode.ONLINE) {
      return;
    }

    const players: Player[] = [];
    
    if (mode === GameMode.VS_CPU) {
      // Player 1
      players.push({
        id: 'p1',
        name: customInitials[0] || 'A',
        color: PLAYER_COLORS[0],
        score: 0
      });
      // CPU
      players.push({
        id: 'p2',
        name: 'CPU',
        color: PLAYER_COLORS[1],
        score: 0
      });
    } else {
      // Local mode
      for (let i = 0; i < playerCount; i++) {
        players.push({
          id: `p${i + 1}`,
          name: customInitials[i] || String.fromCharCode(65 + i),
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          score: 0
        });
      }
    }

    onStart(gridSize, players, mode);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Dots & Boxes</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Configure your game settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-md">
          
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-700">Game Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setMode(GameMode.VS_CPU); setPlayerCount(2); }}
                className={`p-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === GameMode.VS_CPU ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                vs CPU
              </button>
              <button
                type="button"
                onClick={() => setMode(GameMode.LOCAL)}
                className={`p-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === GameMode.LOCAL ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Local
              </button>
              <button
                type="button"
                onClick={() => setMode(GameMode.ONLINE)}
                className={`p-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === GameMode.ONLINE ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Online
              </button>
            </div>
            {mode === GameMode.ONLINE && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                <div className="text-amber-800 font-bold text-sm">
                  Online Multiplayer Coming Soon
                </div>
                <p className="text-amber-700 text-xs">
                  Online mode is currently under development. Please enjoy playing in vs CPU or Local mode.
                </p>
              </div>
            )}
          </div>

          {/* Grid Size & Settings (Only for active playable modes) */}
          {mode !== GameMode.ONLINE && (
            <>
              {/* Grid Size */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Grid Size ({gridSize}x{gridSize})</label>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
                   {GRID_SIZES.map(size => (
                     <button
                       key={size}
                       type="button"
                       onClick={() => setGridSize(size)}
                       className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all ${gridSize === size ? 'bg-blue-600 text-white shadow transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       {size}
                     </button>
                   ))}
                </div>
              </div>

              {/* Player Count (Only for Local) */}
              {mode === GameMode.LOCAL && (
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <label className="text-xs sm:text-sm font-semibold text-slate-700">Players: {playerCount}</label>
                   </div>
                   <input 
                     type="range" 
                     min="2" 
                     max="10" 
                     value={playerCount} 
                     onChange={(e) => setPlayerCount(Number(e.target.value))}
                     className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                   />
                </div>
              )}

              {/* Initials */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  {mode === GameMode.LOCAL ? 'Player Initials' : 'Your Initial'}
                </label>
                
                {mode === GameMode.VS_CPU && (
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <input 
                        type="text" 
                        maxLength={1} 
                        value={customInitials[0]}
                        onChange={(e) => handleInitialChange(0, e.target.value)}
                        className="w-full p-2.5 text-center border-2 rounded-xl focus:outline-none font-black text-base uppercase transition-all"
                        style={{ borderColor: PLAYER_COLORS[0] }}
                        placeholder="P1"
                      />
                      <span className="text-[10px] font-bold" style={{ color: PLAYER_COLORS[0] }}>P1</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <input 
                        type="text" 
                        maxLength={3} 
                        value="CPU"
                        disabled
                        className="w-full p-2.5 text-center border-2 border-slate-200 bg-slate-100 rounded-xl font-black text-base text-slate-400 uppercase"
                        placeholder="CPU"
                      />
                      <span className="text-[10px] font-bold text-slate-400">CPU</span>
                    </div>
                  </div>
                )}

                {mode === GameMode.LOCAL && (
                  <div className="grid grid-cols-5 gap-2 max-w-full overflow-x-auto p-0.5">
                    {Array.from({ length: playerCount }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 min-w-[40px]">
                        <input 
                          type="text" 
                          maxLength={1} 
                          value={customInitials[i] || ''}
                          onChange={(e) => handleInitialChange(i, e.target.value)}
                          className="w-full p-2 text-center border-2 rounded-xl focus:outline-none font-black text-sm sm:text-base uppercase transition-all"
                          style={{ 
                            borderColor: PLAYER_COLORS[i % PLAYER_COLORS.length],
                          }}
                          placeholder={String.fromCharCode(65 + i)}
                        />
                        <span className="text-[10px] font-bold" style={{ color: PLAYER_COLORS[i % PLAYER_COLORS.length] }}>
                          P{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Button 
            type="submit" 
            fullWidth 
            disabled={mode === GameMode.ONLINE}
          >
            {mode === GameMode.ONLINE ? 'Online Mode Coming Soon' : 'Start Game'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;
