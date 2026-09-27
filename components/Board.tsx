import React from 'react';
import { GameState, LineMove, Player } from '../types';

interface BoardProps {
  gameState: GameState;
  onLineClick: (move: LineMove) => void;
  interactive: boolean;
}

const Board: React.FC<BoardProps> = ({ gameState, onLineClick, interactive }) => {
  const { gridSize, hLines, vLines, boxes, players } = gameState;
  
  // Calculate SVG dimensions
  const spacing = 60; // Space between dots
  const padding = 40;
  const dotRadius = 4;
  const lineHitWidth = 24; // Invisible clickable area
  const lineWidth = 6; // Visible line width
  
  const width = gridSize * spacing + padding * 2;
  const height = gridSize * spacing + padding * 2;

  // Helper to find player color by ID
  const getPlayerColor = (pid: string | null) => {
    if (!pid) return 'transparent';
    const player = players.find(p => p.id === pid);
    return player ? player.color : '#cbd5e1';
  };
  
  const getPlayerName = (pid: string | null) => {
    if (!pid) return '';
    const player = players.find(p => p.id === pid);
    return player ? player.name : '';
  };

  return (
    <div className="flex justify-center items-center overflow-auto p-2 md:p-4 max-w-full max-h-full w-full h-full">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="select-none touch-manipulation"
        style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
      >
        {/* Render Boxes (filled backgrounds/initials) */}
        {boxes.map((row, r) => 
          row.map((ownerId, c) => {
            if (!ownerId) return null;
            const x = padding + c * spacing;
            const y = padding + r * spacing;
            const color = getPlayerColor(ownerId);
            const initial = getPlayerName(ownerId);
            
            return (
              <g key={`box-${r}-${c}`}>
                <rect
                  x={x + lineWidth/2}
                  y={y + lineWidth/2}
                  width={spacing - lineWidth}
                  height={spacing - lineWidth}
                  fill={color}
                  fillOpacity={0.2}
                  rx={8}
                />
                <text
                  x={x + spacing/2}
                  y={y + spacing/2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontWeight="bold"
                  fontSize={spacing * 0.5}
                >
                  {initial}
                </text>
              </g>
            );
          })
        )}

        {/* Render Horizontal Lines */}
        {hLines.map((row, r) => 
          row.map((isActive, c) => {
             const x1 = padding + c * spacing;
             const y1 = padding + r * spacing;
             const x2 = x1 + spacing;
             
             return (
               <g key={`h-${r}-${c}`} onClick={() => !isActive && interactive && onLineClick({ type: 'h', row: r, col: c })}>
                 {/* Invisible hit area */}
                 <rect 
                    x={x1 + dotRadius} 
                    y={y1 - lineHitWidth/2} 
                    width={spacing - dotRadius * 2} 
                    height={lineHitWidth} 
                    fill="transparent" 
                    className={!isActive && interactive ? "cursor-pointer hover:fill-slate-100" : ""}
                 />
                 {/* Visible Line */}
                 <line
                   x1={x1}
                   y1={y1}
                   x2={x2}
                   y2={y1}
                   stroke={isActive ? '#1e293b' : '#e2e8f0'}
                   strokeWidth={isActive ? lineWidth : 2}
                   strokeLinecap="round"
                   className="transition-all duration-300"
                 />
               </g>
             );
          })
        )}

        {/* Render Vertical Lines */}
        {vLines.map((row, r) => 
          row.map((isActive, c) => {
             const x1 = padding + c * spacing;
             const y1 = padding + r * spacing;
             const y2 = y1 + spacing;
             
             return (
               <g key={`v-${r}-${c}`} onClick={() => !isActive && interactive && onLineClick({ type: 'v', row: r, col: c })}>
                 {/* Invisible hit area */}
                 <rect 
                    x={x1 - lineHitWidth/2} 
                    y={y1 + dotRadius} 
                    width={lineHitWidth} 
                    height={spacing - dotRadius * 2} 
                    fill="transparent" 
                    className={!isActive && interactive ? "cursor-pointer hover:fill-slate-100" : ""}
                 />
                 {/* Visible Line */}
                 <line
                   x1={x1}
                   y1={y1}
                   x2={x1}
                   y2={y2}
                   stroke={isActive ? '#1e293b' : '#e2e8f0'}
                   strokeWidth={isActive ? lineWidth : 2}
                   strokeLinecap="round"
                   className="transition-all duration-300"
                 />
               </g>
             );
          })
        )}

        {/* Render Dots */}
        {Array.from({ length: gridSize + 1 }).map((_, r) => 
          Array.from({ length: gridSize + 1 }).map((_, c) => (
             <circle
               key={`dot-${r}-${c}`}
               cx={padding + c * spacing}
               cy={padding + r * spacing}
               r={dotRadius}
               fill="#334155"
             />
          ))
        )}
      </svg>
    </div>
  );
};

export default Board;
