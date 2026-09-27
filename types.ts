export enum GameMode {
  LOCAL = 'LOCAL',
  VS_CPU = 'VS_CPU',
  ONLINE = 'ONLINE'
}

export interface Player {
  id: string;
  name: string; // Used for initials
  color: string;
  score: number;
}

export interface GameState {
  gridSize: number; // e.g., 4 for 4x4 boxes
  hLines: boolean[][]; // [row][col]
  vLines: boolean[][]; // [row][col]
  boxes: (string | null)[][]; // [row][col] -> playerId or null
  currentPlayerIndex: number;
  players: Player[];
  isGameOver: boolean;
  winner: string | null; // Player ID or 'DRAW'
}

export interface LineMove {
  type: 'h' | 'v';
  row: number;
  col: number;
}

// For Minimax
export interface AIResult {
  move: LineMove | null;
  score: number;
}