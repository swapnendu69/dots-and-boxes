import React, { useState, useEffect, useCallback } from 'react';
import { GameState, LineMove, Player, GameMode } from '../types';
import { checkBoxCompletion, createInitialState, computeBestMove, getAvailableMoves } from '../utils/gameLogic';
import { CPU_DELAY_MS } from '../constants';
import Board from './Board';
import Button from './Button';

interface GameScreenProps {
  gridSize: number;
  players: Player[];
  mode: GameMode;
  onExit: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ gridSize, players, mode, onExit }) => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(gridSize, players));
  const [isCPUTurn, setIsCPUTurn] = useState(false);

  // Determine active player
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  
  const handleMove = useCallback((move: LineMove) => {
    const { type, row, col } = move;

    setGameState(prevState => {
      if (prevState.isGameOver) return prevState;

      // Prevent moves on already drawn lines
      if (type === 'h' && prevState.hLines[row][col]) return prevState;
      if (type === 'v' && prevState.vLines[row][col]) return prevState;

      const newState = { ...prevState };
      newState.hLines = prevState.hLines.map(r => [...r]);
      newState.vLines = prevState.vLines.map(r => [...r]);
      newState.boxes = prevState.boxes.map(r => [...r]);
      newState.players = prevState.players.map(p => ({ ...p }));

      // Update Line
      if (type === 'h') newState.hLines[row][col] = true;
      else newState.vLines[row][col] = true;

      const activeP = prevState.players[prevState.currentPlayerIndex];

      // Check Boxes
      const { boxesCompleted, newBoxes } = checkBoxCompletion(newState, move, activeP.id);

      if (boxesCompleted > 0) {
        // Player keeps turn
        newState.boxes = newBoxes;
        newState.players[prevState.currentPlayerIndex].score += boxesCompleted;
      } else {
        // Next Turn
        newState.currentPlayerIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length;
      }

      // Check Game Over
      const totalBoxes = gridSize * gridSize;
      const filledBoxes = newState.players.reduce((acc, p) => acc + p.score, 0);
      if (filledBoxes === totalBoxes) {
        newState.isGameOver = true;
        // Find winner
        const maxScore = Math.max(...newState.players.map(p => p.score));
        const winners = newState.players.filter(p => p.score === maxScore);
        newState.winner = winners.length > 1 ? 'DRAW' : winners[0].id;
      }

      return newState;
    });
  }, [gridSize]);

  // CPU Effect
  useEffect(() => {
    if (mode === GameMode.VS_CPU && !gameState.isGameOver) {
      const isCpu = gameState.currentPlayerIndex === 1;
      setIsCPUTurn(isCpu);

      if (isCpu) {
        const timer = setTimeout(() => {
          const move = computeBestMove(gameState);
          handleMove(move);
        }, CPU_DELAY_MS);
        return () => clearTimeout(timer);
      }
    } else {
      setIsCPUTurn(false);
    }
  }, [gameState.currentPlayerIndex, gameState.isGameOver, mode, handleMove]);


  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-2.5 sm:p-4 shadow-sm z-10">
        <div className="flex justify-between items-center max-w-2xl mx-auto gap-2">
          <Button variant="outline" onClick={onExit} className="!py-1.5 !px-3 text-xs">
            &larr; Exit
          </Button>
          <div className="font-bold text-xs sm:text-sm text-slate-800 text-center truncate">
             {gameState.isGameOver ? (
               <span className="text-blue-600 font-black">
                 {gameState.winner === 'DRAW' ? 'Game Drawn!' : `Winner: ${gameState.players.find(p => p.id === gameState.winner)?.name}`}
               </span>
             ) : (
               <span>Current Turn: <span className="font-black px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: activePlayer.color }}>{activePlayer.name}</span></span>
             )}
          </div>
          <div className="w-12 sm:w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="w-full max-w-2xl mx-auto flex flex-wrap justify-center items-center gap-1.5 sm:gap-3 py-2 px-2 bg-slate-50 overflow-x-auto max-h-24">
        {gameState.players.map(player => {
          const isActive = gameState.players[gameState.currentPlayerIndex].id === player.id;
          return (
            <div 
              key={player.id} 
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition-all ${
                isActive 
                ? 'border-blue-500 bg-white shadow-md scale-105 z-10 ring-2 ring-blue-400/20' 
                : 'border-slate-200 bg-white/70 opacity-80'
              }`}
            >
              <div 
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
                style={{ backgroundColor: player.color }}
              >
                {player.name}
              </div>
              <div className="text-sm sm:text-base font-black text-slate-800">{player.score}</div>
            </div>
          );
        })}
      </div>

      {/* Game Board Area */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-auto relative min-h-0">
        <Board 
          gameState={gameState} 
          onLineClick={handleMove} 
          interactive={!gameState.isGameOver && !isCPUTurn}
        />
        
        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border border-slate-100 max-w-xs w-full mx-4">
                <h2 className="text-3xl font-black text-slate-800 mb-2">Game Over!</h2>
                <p className="text-lg text-slate-600 mb-6">
                  {gameState.winner === 'DRAW' 
                    ? "It's a Draw!" 
                    : `${gameState.players.find(p => p.id === gameState.winner)?.name} Wins!`}
                </p>
                <Button fullWidth onClick={onExit}>Play Again</Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;
