// SudokuBoard.tsx - Complete working version with all features

import React, { useState, useEffect } from 'react';
import SudokuCell from './SudokuCell';
import './SudokuBoard.css';
import { 
  findAllConflicts, 
  isBoardSolved, 
  isBoardValid,
  getAvailableNumbers,
  CellConflict 
} from '../utils/sudokuValidator';
import {generateSymmetricPuzzle, Difficulty } from '../utils/sudokuGenerator';
import { getNextHint, solveSudoku } from '../utils/sudokuSolver';

type BoardState = (number | null)[][];

const SudokuBoard: React.FC = () => {
  // Game state
  const [board, setBoard] = useState<BoardState>(() => {
    return Array(9).fill(null).map(() => Array(9).fill(null));
  });

  // Track fixed cells (puzzle cells)
  const [fixedCells, setFixedCells] = useState<boolean[][]>(() => {
    return Array(9).fill(null).map(() => Array(9).fill(false));
  });

  // Track conflicts on the board
  const [conflicts, setConflicts] = useState<Map<string, CellConflict[]>>(new Map());
  
  // Track selected cell
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  
  // Track if the puzzle is solved
  const [isSolved, setIsSolved] = useState(false);
    
  // Game statistics
  const [moveCount, setMoveCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // NEW: Add these state variables for generator and solver
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);

  // Check for conflicts whenever board changes
  useEffect(() => {
    const newConflicts = findAllConflicts(board);
    setConflicts(newConflicts);
    
    // Check if puzzle is solved
    if (isBoardSolved(board)) {
      setIsSolved(true);
      // Show success message
      setTimeout(() => {
        alert(`🎉 Congratulations! You solved the puzzle in ${moveCount} moves!`);
      }, 500);
    } else {
      setIsSolved(false);
    }
  }, [board, moveCount]);

  // Handle cell value change
  const handleCellChange = (row: number, col: number, value: number | null) => {
    // Don't allow changes to fixed cells
    if (fixedCells[row][col]) return;
    
    // Create new board
    const newBoard = board.map(row => [...row]);
    const oldValue = newBoard[row][col];
    newBoard[row][col] = value;
    
    // Update move count
    if (oldValue === null && value !== null) {
      setMoveCount(moveCount + 1);
    }
    
    // Check if this creates a conflict
    const tempConflicts = findAllConflicts(newBoard);
    if (tempConflicts.size > conflicts.size) {
      setErrorCount(errorCount + 1);
    }
    
    setBoard(newBoard);
  };

  // Handle cell selection
  const handleCellFocus = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  // Check if a cell is in conflict
  const isCellConflicting = (row: number, col: number): boolean => {
    const key = `${row}-${col}`;
    return conflicts.has(key);
  };

  // Check if a cell should be highlighted (same number as selected)
  const shouldHighlightCell = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const selectedValue = board[selectedCell.row][selectedCell.col];
    if (!selectedValue) return false;
    return board[row][col] === selectedValue;
  };

  // Load a puzzle onto the board
  const loadPuzzle = (puzzle: BoardState) => {
    const fixed = puzzle.map(row => 
      row.map(cell => cell !== null)
    );
    
    setBoard(puzzle);
    setFixedCells(fixed);
    setMoveCount(0);
    setErrorCount(0);
    setIsSolved(false);
    setSelectedCell(null);
  };

  // Generate puzzle with difficulty
  const generatePuzzle = async (level: Difficulty) => {
    setIsGenerating(true);
    setDifficulty(level);
    
    // Show loading state
    setTimeout(() => {
      const puzzle = generateSymmetricPuzzle(level);
      loadPuzzle(puzzle);
      setIsGenerating(false);
    }, 100);
  };

  // Generate example puzzle (easy level)
  const generateEasyPuzzle = () => {
    generatePuzzle(Difficulty.EASY);
  };

  // Generate medium puzzle
  const generateMediumPuzzle = () => {
    generatePuzzle(Difficulty.MEDIUM);
  };

  // Generate hard puzzle
  const generateHardPuzzle = () => {
    generatePuzzle(Difficulty.HARD);
  };

  // Solve puzzle instantly
  const solvePuzzle = () => {
    // Create a copy of the board
    const boardCopy = board.map(row => [...row]);
    
    // Solve it
    if (solveSudoku(boardCopy)) {
      setBoard(boardCopy);
      setIsSolved(true);
      alert('🎯 Puzzle solved!');
    } else {
      alert('❌ This puzzle cannot be solved. Check for conflicts!');
    }
  };


  // Get smart hint
  const getSmartHint = () => {
    const hint = getNextHint(board);
    if (hint) {
      // Highlight the cell and show the value
      setSelectedCell({ row: hint.row, col: hint.col });
      
      // Optionally fill it in after a delay
      setTimeout(() => {
        const response = window.confirm(
          `The value for cell (${hint.row + 1}, ${hint.col + 1}) should be ${hint.value}. 
          Would you like to fill it in?`
        );
        if (response) {
          handleCellChange(hint.row, hint.col, hint.value);
        }
      }, 100);
    } else {
      alert('No hints available. The puzzle might be complete or unsolvable.');
    }
  };

  // Clear only user entries
  const clearUserEntries = () => {
    const newBoard = board.map((row, rowIndex) =>
      row.map((cell, colIndex) => 
        fixedCells[rowIndex][colIndex] ? cell : null
      )
    );
    setBoard(newBoard);
    setMoveCount(0);
    setErrorCount(0);
  };

  // Clear entire board
  const clearBoard = () => {
    setBoard(Array(9).fill(null).map(() => Array(9).fill(null)));
    setFixedCells(Array(9).fill(null).map(() => Array(9).fill(false)));
    setMoveCount(0);
    setErrorCount(0);
    setSelectedCell(null);
    setIsSolved(false);
  };

  // Check current solution
  const checkSolution = () => {
    if (isBoardValid(board)) {
      // Check if complete
      const hasEmpty = board.some(row => row.some(cell => cell === null));
      if (hasEmpty) {
        alert('✅ No errors so far! Keep going!');
      } else {
        alert('🎉 Perfect! The puzzle is solved correctly!');
      }
    } else {
      alert('❌ There are some conflicts. Check the highlighted cells!');
    }
  };

  // Get hint for selected cell
  const getHint = () => {
    if (!selectedCell) {
      alert('Please select a cell first!');
      return;
    }
    
    const { row, col } = selectedCell;
    if (fixedCells[row][col]) {
      alert('This cell is already filled!');
      return;
    }
    
    const available = getAvailableNumbers(board, row, col);
    if (available.length === 0) {
      alert('No valid numbers for this cell. Check for conflicts!');
    } else if (available.length === 1) {
      alert(`The only valid number for this cell is: ${available[0]}`);
    } else {
      alert(`Valid numbers for this cell: ${available.join(', ')}`);
    }
  };

  return (
    <div className="sudoku-container">
      
      {/* Game Statistics */}
      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Moves:</span>
          <span className="stat-value">{moveCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Errors:</span>
          <span className="stat-value error">{errorCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Status:</span>
          <span className={`stat-value ${isSolved ? 'success' : ''}`}>
            {isSolved ? '✅ Solved!' : '🎯 In Progress'}
          </span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="controls">
        <div className="control-group">
          <label>New Puzzle:</label>
          <button 
            onClick={generateEasyPuzzle} 
            className="btn btn-primary"
            disabled={isGenerating || isSolving}
          >
            {isGenerating && difficulty === Difficulty.EASY ? '⏳' : 'Easy'}
          </button>
          <button 
            onClick={generateMediumPuzzle} 
            className="btn btn-primary"
            disabled={isGenerating || isSolving}
          >
            {isGenerating && difficulty === Difficulty.MEDIUM ? '⏳' : 'Medium'}
          </button>
          <button 
            onClick={generateHardPuzzle} 
            className="btn btn-primary"
            disabled={isGenerating || isSolving}
          >
            {isGenerating && difficulty === Difficulty.HARD ? '⏳' : 'Hard'}
          </button>
        </div>
        
        <div className="control-group">
          <label>Solver:</label>
          <button 
            onClick={solvePuzzle} 
            className="btn btn-success"
            disabled={isSolving}
          >
            Instant Solve
          </button>
        </div>
        
        <div className="control-group">
          <label>Actions:</label>
          <button onClick={clearUserEntries} className="btn btn-secondary">
            Reset
          </button>
          <button onClick={clearBoard} className="btn btn-secondary">
            Clear All
          </button>
        </div>
        
        <div className="control-group">
          <label>Help:</label>
          <button onClick={checkSolution} className="btn btn-info">
            Check
          </button>
          <button onClick={getSmartHint} className="btn btn-info">
            Smart Hint
          </button>
          <button onClick={getHint} className="btn btn-info">
            Hint
          </button>
        
        </div>
      </div>

      {/* The Sudoku grid */}
      <div className={`sudoku-board ${isSolved ? 'solved' : ''}`}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => (
              <SudokuCell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                onFocus={() => handleCellFocus(rowIndex, colIndex)}
                isFixed={fixedCells[rowIndex][colIndex]}
                isConflicting={isCellConflicting(rowIndex, colIndex)}
                isHighlighted={shouldHighlightCell(rowIndex, colIndex)}
                isSelected={
                  selectedCell?.row === rowIndex && 
                  selectedCell?.col === colIndex
                }
                
                row={rowIndex}
                col={colIndex}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SudokuBoard;