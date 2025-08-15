// sudokuGenerator.ts - Improved generator with better cell distribution

import { isValidMove } from './sudokuValidator';

type Board = (number | null)[][];

/**
 * Difficulty levels with better distribution
 */
export enum Difficulty {
  EASY = 'easy',       // 35-40 clues (41-46 empty)
  MEDIUM = 'medium',   // 27-32 clues (49-54 empty)
  HARD = 'hard',       // 22-27 clues (54-59 empty)
  EXPERT = 'expert'    // 17-22 clues (59-64 empty)
}

/**
 * Shuffle an array randomly (Fisher-Yates algorithm)
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Generate a complete, valid Sudoku board using backtracking
 */
const generateCompleteSudoku = (): Board => {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
  
  const fillBoard = (row: number, col: number): boolean => {
    if (row === 9) {
      return true;
    }
    
    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;
    
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    for (const num of numbers) {
      if (isValidMove(board, row, col, num)) {
        board[row][col] = num;
        
        if (fillBoard(nextRow, nextCol)) {
          return true;
        }
        
        board[row][col] = null;
      }
    }
    
    return false;
  };
  
  fillBoard(0, 0);
  return board;
};

/**
 * Count how many cells are filled in a 3x3 box
 */
const countFilledInBox = (board: Board, boxRow: number, boxCol: number): number => {
  let count = 0;
  const startRow = boxRow * 3;
  const startCol = boxCol * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] !== null) {
        count++;
      }
    }
  }
  return count;
};

/**
 * Get minimum and maximum clues per box for each difficulty
 */
const getBoxConstraints = (difficulty: Difficulty): { min: number, max: number } => {
  switch (difficulty) {
    case Difficulty.EASY:
      return { min: 3, max: 6 };  // Each box has 3-6 clues
    case Difficulty.MEDIUM:
      return { min: 2, max: 5 };  // Each box has 2-5 clues
    case Difficulty.HARD:
      return { min: 1, max: 4 };  // Each box has 1-4 clues
    case Difficulty.EXPERT:
      return { min: 0, max: 3 };  // Each box has 0-3 clues
    default:
      return { min: 3, max: 6 };
  }
};

/**
 * Get total clues range for difficulty
 */
const getCluesRange = (difficulty: Difficulty): { min: number, max: number } => {
  switch (difficulty) {
    case Difficulty.EASY:
      return { min: 36, max: 41 };
    case Difficulty.MEDIUM:
      return { min: 27, max: 32 };
    case Difficulty.HARD:
      return { min: 22, max: 27 };
    case Difficulty.EXPERT:
      return { min: 17, max: 22 };
    default:
      return { min: 36, max: 41 };
  }
};

/**
 * Remove cells with better distribution across boxes
 */
const removeCellsImproved = (board: Board, difficulty: Difficulty): Board => {
  const puzzle = board.map(row => [...row]);
  const { min: minPerBox, max: maxPerBox } = getBoxConstraints(difficulty);
  const { min: minTotal, max: maxTotal } = getCluesRange(difficulty);
  
  // Calculate target number of clues
  const targetClues = minTotal + Math.floor(Math.random() * (maxTotal - minTotal + 1));
  const targetEmpty = 81 - targetClues;
  
  // Track cells removed per box
  const boxRemovals: number[][] = Array(3).fill(null).map(() => Array(3).fill(0));
  
  // Create list of all cells grouped by box
  const cellsByBox: [number, number][][][] = Array(3).fill(null).map(() => 
    Array(3).fill(null).map(() => [])
  );
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      cellsByBox[boxRow][boxCol].push([row, col]);
    }
  }
  
  // Shuffle cells within each box
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      cellsByBox[boxRow][boxCol] = shuffleArray(cellsByBox[boxRow][boxCol]);
    }
  }
  
  let totalRemoved = 0;
  const maxRemovedPerBox = 9 - minPerBox;
  const minRemovedPerBox = 9 - maxPerBox;
  
  // First pass: ensure minimum removals per box
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells = cellsByBox[boxRow][boxCol];
      const toRemove = minRemovedPerBox;
      
      for (let i = 0; i < toRemove && i < cells.length; i++) {
        const [row, col] = cells[i];
        puzzle[row][col] = null;
        boxRemovals[boxRow][boxCol]++;
        totalRemoved++;
      }
    }
  }
  
  // Second pass: remove additional cells up to target, respecting max per box
  const allCells: [number, number, number, number][] = []; // [row, col, boxRow, boxCol]
  
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells = cellsByBox[boxRow][boxCol];
      // Start from where we left off in first pass
      for (let i = minRemovedPerBox; i < cells.length; i++) {
        allCells.push([...cells[i], boxRow, boxCol]);
      }
    }
  }
  
  // Shuffle for random selection
  const shuffledCells = shuffleArray(allCells);
  
  for (const [row, col, boxRow, boxCol] of shuffledCells) {
    if (totalRemoved >= targetEmpty) break;
    if (boxRemovals[boxRow][boxCol] >= maxRemovedPerBox) continue;
    
    puzzle[row][col] = null;
    boxRemovals[boxRow][boxCol]++;
    totalRemoved++;
  }
  
  return puzzle;
};

/**
 * Generate symmetric puzzle with better distribution
 */
export const generateSymmetricPuzzle = (difficulty: Difficulty = Difficulty.EASY): Board => {
  const completeSudoku = generateCompleteSudoku();
  const puzzle = completeSudoku.map(row => [...row]);
  
  const { min: minTotal, max: maxTotal } = getCluesRange(difficulty);
  const targetClues = minTotal + Math.floor(Math.random() * (maxTotal - minTotal + 1));
  const targetEmpty = 81 - targetClues;
  
  // Ensure even number for symmetry
  const cellsToRemove = targetEmpty % 2 === 0 ? targetEmpty : targetEmpty - 1;
  
  // Track removals per box
  const boxRemovals: number[][] = Array(3).fill(null).map(() => Array(3).fill(0));
  const { min: minPerBox,} = getBoxConstraints(difficulty);
  const maxRemovedPerBox = 9 - minPerBox;
  
  // Generate positions for symmetric removal
  const positions: [number, number][] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      // Skip center cell if odd total
      if (row === 4 && col === 4) continue;
      // Only add positions from upper half for symmetry
      if (row < 4 || (row === 4 && col < 4)) {
        positions.push([row, col]);
      }
    }
  }
  
  const shuffledPositions = shuffleArray(positions);
  let removed = 0;
  
  for (const [row, col] of shuffledPositions) {
    if (removed >= cellsToRemove) break;
    
    // Check box constraints
    const boxRow1 = Math.floor(row / 3);
    const boxCol1 = Math.floor(col / 3);
    const boxRow2 = Math.floor((8 - row) / 3);
    const boxCol2 = Math.floor((8 - col) / 3);
    
    // Skip if either box would exceed max removals
    if (boxRemovals[boxRow1][boxCol1] >= maxRemovedPerBox ||
        boxRemovals[boxRow2][boxCol2] >= maxRemovedPerBox) {
      continue;
    }
    
    // Remove symmetric pair
    puzzle[row][col] = null;
    puzzle[8 - row][8 - col] = null;
    
    boxRemovals[boxRow1][boxCol1]++;
    boxRemovals[boxRow2][boxCol2]++;
    removed += 2;
  }
  
  return puzzle;
};

/**
 * Main puzzle generator with improved distribution
 */
export const generateSudokuPuzzle = (difficulty: Difficulty = Difficulty.EASY): Board => {
  const completeSudoku = generateCompleteSudoku();
  return removeCellsImproved(completeSudoku, difficulty);
};

/**
 * Generate a puzzle ensuring no complete boxes (for better gameplay)
 */
export const generateBalancedPuzzle = (difficulty: Difficulty = Difficulty.EASY): Board => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const puzzle = generateSudokuPuzzle(difficulty);
    
    // Check if any box is completely filled
    let hasCompleteBox = false;
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const filled = countFilledInBox(puzzle, boxRow, boxCol);
        if (filled === 9) {
          hasCompleteBox = true;
          break;
        }
      }
      if (hasCompleteBox) break;
    }
    
    // If no complete boxes, return this puzzle
    if (!hasCompleteBox) {
      return puzzle;
    }
    
    attempts++;
  }
  
  // Fallback to regular generation if we couldn't get a perfect one
  return generateSudokuPuzzle(difficulty);
};

/**
 * Validate that a puzzle has exactly one solution
 */
export const hasUniqueSolution = (puzzle: Board): boolean => {
  const testBoard = puzzle.map(row => [...row]);
  let solutionCount = 0;
  
  const solve = (): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (testBoard[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(testBoard, row, col, num)) {
              testBoard[row][col] = num;
              
              if (solve()) {
                return true;
              }
              
              testBoard[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    
    solutionCount++;
    return solutionCount >= 2;
  };
  
  solve();
  return solutionCount === 1;
};