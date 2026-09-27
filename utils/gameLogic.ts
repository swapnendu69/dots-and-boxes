import { GameState, LineMove, Player } from '../types';

export const createInitialState = (gridSize: number, players: Player[]): GameState => {
  // gridSize is number of boxes.
  // Dots are (gridSize + 1) x (gridSize + 1)
  // Horizontal lines: (gridSize + 1) rows, (gridSize) cols
  // Vertical lines: (gridSize) rows, (gridSize + 1) cols
  
  const hLines = Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(false));
  const vLines = Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(false));
  const boxes = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

  return {
    gridSize,
    hLines,
    vLines,
    boxes,
    currentPlayerIndex: 0,
    players,
    isGameOver: false,
    winner: null,
  };
};

export const checkBoxCompletion = (
  gameState: GameState,
  lastMove: LineMove,
  playerId: string
): { boxesCompleted: number; newBoxes: (string | null)[][] } => {
  const { gridSize, hLines, vLines, boxes } = gameState;
  const newBoxes = boxes.map(row => [...row]);
  let boxesCompleted = 0;

  // A move can complete up to 2 boxes (adjacent)
  // Check the box(es) related to this line.

  const { type, row, col } = lastMove;

  if (type === 'h') {
    // Horizontal line at row, col
    // Affects box at [row, col] (below line) and [row-1, col] (above line)
    
    // Check box below (if valid)
    if (row < gridSize) {
      if (hLines[row][col] && hLines[row+1][col] && vLines[row][col] && vLines[row][col+1]) {
         if (!newBoxes[row][col]) {
           newBoxes[row][col] = playerId;
           boxesCompleted++;
         }
      }
    }
    // Check box above (if valid)
    if (row > 0) {
      if (hLines[row-1][col] && hLines[row][col] && vLines[row-1][col] && vLines[row-1][col+1]) {
        if (!newBoxes[row-1][col]) {
          newBoxes[row-1][col] = playerId;
          boxesCompleted++;
        }
      }
    }
  } else {
    // Vertical line at row, col
    // Affects box at [row, col] (right of line) and [row, col-1] (left of line)
    
    // Check box right
    if (col < gridSize) {
       if (hLines[row][col] && hLines[row+1][col] && vLines[row][col] && vLines[row][col+1]) {
         if (!newBoxes[row][col]) {
           newBoxes[row][col] = playerId;
           boxesCompleted++;
         }
       }
    }
    // Check box left
    if (col > 0) {
      if (hLines[row][col-1] && hLines[row+1][col-1] && vLines[row][col-1] && vLines[row][col]) {
        if (!newBoxes[row][col-1]) {
          newBoxes[row][col-1] = playerId;
          boxesCompleted++;
        }
      }
    }
  }

  return { boxesCompleted, newBoxes };
};

export const getAvailableMoves = (state: GameState): LineMove[] => {
  const moves: LineMove[] = [];
  const { gridSize, hLines, vLines } = state;

  for (let r = 0; r <= gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!hLines[r][c]) moves.push({ type: 'h', row: r, col: c });
    }
  }
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c <= gridSize; c++) {
      if (!vLines[r][c]) moves.push({ type: 'v', row: r, col: c });
    }
  }
  return moves;
};

// Helper to count sides of a box at [r, c]
const getBoxSidesCount = (hLines: boolean[][], vLines: boolean[][], r: number, c: number): number => {
  let sides = 0;
  if (hLines[r][c]) sides++;
  if (hLines[r + 1][c]) sides++;
  if (vLines[r][c]) sides++;
  if (vLines[r][c + 1]) sides++;
  return sides;
};

// Lightweight, instant AI move selection without memory allocation
export const computeBestMove = (state: GameState): LineMove => {
  const moves = getAvailableMoves(state);
  if (moves.length === 0) return { type: 'h', row: 0, col: 0 };

  const { gridSize, hLines, vLines } = state;

  const completingMoves: LineMove[] = [];
  const safeMoves: LineMove[] = [];

  for (const move of moves) {
    const { type, row, col } = move;
    let maxAdjacentSides = 0;
    let createsThreeSides = false;

    if (type === 'h') {
      // Box below (row, col)
      if (row < gridSize) {
        const sides = getBoxSidesCount(hLines, vLines, row, col);
        maxAdjacentSides = Math.max(maxAdjacentSides, sides);
        if (sides === 2) createsThreeSides = true;
      }
      // Box above (row-1, col)
      if (row > 0) {
        const sides = getBoxSidesCount(hLines, vLines, row - 1, col);
        maxAdjacentSides = Math.max(maxAdjacentSides, sides);
        if (sides === 2) createsThreeSides = true;
      }
    } else {
      // Box right (row, col)
      if (col < gridSize) {
        const sides = getBoxSidesCount(hLines, vLines, row, col);
        maxAdjacentSides = Math.max(maxAdjacentSides, sides);
        if (sides === 2) createsThreeSides = true;
      }
      // Box left (row, col-1)
      if (col > 0) {
        const sides = getBoxSidesCount(hLines, vLines, row, col - 1);
        maxAdjacentSides = Math.max(maxAdjacentSides, sides);
        if (sides === 2) createsThreeSides = true;
      }
    }

    if (maxAdjacentSides === 3) {
      completingMoves.push(move);
    } else if (!createsThreeSides) {
      safeMoves.push(move);
    }
  }

  // 1. Prioritize moves that complete a box
  if (completingMoves.length > 0) {
    return completingMoves[Math.floor(Math.random() * completingMoves.length)];
  }

  // 2. Choose a safe move (one that does not leave 3 sides on any box)
  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // 3. Fallback: pick any remaining move
  return moves[Math.floor(Math.random() * moves.length)];
};
