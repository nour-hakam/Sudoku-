// sudokuSolver.ts - Solve Sudoku puzzles using backtracking

import { isValidMove } from './sudokuValidator';

type Board = (number | null)[][];

/**
 * Solve a Sudoku puzzle using backtracking
 * @param board - The puzzle to solve (will be modified)
 * @returns true if solved, false if unsolvable
 */
export const solveSudoku = (board: Board): boolean => {
  // Find the first empty cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        // Try numbers 1-9
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            // Place the number
            board[row][col] = num;
            
            // Recursively solve the rest
            if (solveSudoku(board)) {
              return true; // Puzzle solved!
            }
            
            // Backtrack: this number didn't work
            board[row][col] = null;
          }
        }
        
        // No valid number found for this cell
        return false;
      }
    }
  }
  
  // No empty cells left - puzzle is solved!
  return true;
};

/**
 * Get a hint for the next move
 * @param board - Current board state
 * @returns Object with row, col, and value for the hint, or null if no hint available
 */
export const getNextHint = (board: Board): {row: number, col: number, value: number} | null => {
  // Create a copy to solve
  const solvedBoard = board.map(row => [...row]);
  
  // Solve the puzzle
  if (!solveSudoku(solvedBoard)) {
    return null; // Puzzle is unsolvable
  }
  
  // Find the first empty cell and return its solution
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null && solvedBoard[row][col] !== null) {
        return {
          row,
          col,
          value: solvedBoard[row][col]!
        };
      }
    }
  }
  
  return null; // No empty cells
};


/**
 * Check if a partially filled board can be solved
 * @param board - The board to check
 * @returns true if the board is solvable
 */
export const isSolvable = (board: Board): boolean => {
  // Create a copy to avoid modifying the original
  const testBoard = board.map(row => [...row]);
  return solveSudoku(testBoard);
};