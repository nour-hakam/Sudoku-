// sudokuValidator.ts - All validation logic for Sudoku rules

// Type definition for our board
type Board = (number | null)[][];

// Type for tracking conflicts
export interface CellConflict {
  row: number;
  col: number;
}

/**
 * Check if a number is valid in a specific position
 * @param board - The current Sudoku board
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @param num - Number to check (1-9)
 * @returns true if the number is valid at this position
 */
export const isValidMove = (
  board: Board,
  row: number,
  col: number,
  num: number
): boolean => {
  // Check if the number already exists in the same row
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) {
      return false; // Found duplicate in row
    }
  }

  // Check if the number already exists in the same column
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === num) {
      return false; // Found duplicate in column
    }
  }

  // Check if the number exists in the same 3x3 box
  // Calculate which 3x3 box we're in
  const boxStartRow = row - (row % 3); // 0, 3, or 6
  const boxStartCol = col - (col % 3); // 0, 3, or 6

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = boxStartRow + i;
      const currentCol = boxStartCol + j;
      
      // Skip the cell we're checking
      if (currentRow === row && currentCol === col) continue;
      
      if (board[currentRow][currentCol] === num) {
        return false; // Found duplicate in 3x3 box
      }
    }
  }

  return true; // No conflicts found, move is valid
};

/**
 * Find all cells that conflict with a specific cell
 * @param board - The current Sudoku board
 * @param row - Row index of the cell to check
 * @param col - Column index of the cell to check
 * @returns Array of conflicting cell positions
 */
export const findConflicts = (
  board: Board,
  row: number,
  col: number
): CellConflict[] => {
  const conflicts: CellConflict[] = [];
  const value = board[row][col];
  
  // If cell is empty, no conflicts
  if (value === null) return conflicts;

  // Check row for duplicates
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === value) {
      conflicts.push({ row, col: x });
    }
  }

  // Check column for duplicates
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === value) {
      conflicts.push({ row: x, col });
    }
  }

  // Check 3x3 box for duplicates
  const boxStartRow = row - (row % 3);
  const boxStartCol = col - (col % 3);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = boxStartRow + i;
      const currentCol = boxStartCol + j;
      
      if (currentRow === row && currentCol === col) continue;
      
      if (board[currentRow][currentCol] === value) {
        conflicts.push({ row: currentRow, col: currentCol });
      }
    }
  }

  return conflicts;
};

/**
 * Find all conflicts on the entire board
 * @param board - The current Sudoku board
 * @returns Map of cell positions to their conflicts
 */
export const findAllConflicts = (board: Board): Map<string, CellConflict[]> => {
  const allConflicts = new Map<string, CellConflict[]>();
  
  // Check each cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) {
        const conflicts = findConflicts(board, row, col);
        if (conflicts.length > 0) {
          // Create a unique key for this cell
          const key = `${row}-${col}`;
          allConflicts.set(key, conflicts);
        }
      }
    }
  }
  
  return allConflicts;
};

/**
 * Check if the entire board is valid (no conflicts)
 * @param board - The current Sudoku board
 * @returns true if the board has no conflicts
 */
export const isBoardValid = (board: Board): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) {
        const conflicts = findConflicts(board, row, col);
        if (conflicts.length > 0) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * Check if the board is completely filled and valid (solved)
 * @param board - The current Sudoku board
 * @returns true if the puzzle is solved
 */
export const isBoardSolved = (board: Board): boolean => {
  // First check if all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        return false; // Found empty cell
      }
    }
  }
  
  // Then check if the board is valid
  return isBoardValid(board);
};

/**
 * Get available numbers for a specific cell
 * @param board - The current Sudoku board
 * @param row - Row index
 * @param col - Column index
 * @returns Array of valid numbers (1-9) for this position
 */
export const getAvailableNumbers = (
  board: Board,
  row: number,
  col: number
): number[] => {
  // If cell is already filled, return empty array
  if (board[row][col] !== null) {
    return [];
  }
  
  const available: number[] = [];
  
  // Check each number from 1 to 9
  for (let num = 1; num <= 9; num++) {
    if (isValidMove(board, row, col, num)) {
      available.push(num);
    }
  }
  
  return available;
};