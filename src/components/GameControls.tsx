// GameControls.tsx - Organized control panel for the game

import React from 'react';
import { Difficulty } from '../utils/sudokuGenerator';
import './GameControls.css';

interface GameControlsProps {
  onGeneratePuzzle: (difficulty: Difficulty) => void;
  onSolvePuzzle: () => void;
  onClear: () => void;
  onReset: () => void;
  onCheck: () => void;
  onHint: () => void;
  onToggleHints: () => void;
  showHints: boolean;
  isGenerating: boolean;
  isSolving: boolean;
  currentDifficulty: Difficulty;
}

const GameControls: React.FC<GameControlsProps> = ({
  onGeneratePuzzle,
  onSolvePuzzle,
  onClear,
  onReset,
  onCheck,
  onHint,
  onToggleHints,
  showHints,
  isGenerating,
  isSolving,
  currentDifficulty
}) => {
  return (
    <div className="game-controls">
      {/* Difficulty Selection */}
      <div className="control-section">
        <h3>📝 New Puzzle</h3>
        <div className="difficulty-buttons">
          {Object.values(Difficulty).map(level => (
            <button
              key={level}
              onClick={() => onGeneratePuzzle(level)}
              className={`btn-difficulty ${currentDifficulty === level ? 'active' : ''}`}
              disabled={isGenerating || isSolving}
            >
              {isGenerating && currentDifficulty === level ? '⏳' : ''} 
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Solver Controls */}
      <div className="control-section">
        <h3>🤖 Solver</h3>
        <div className="solver-buttons">
          <button 
            onClick={onSolvePuzzle}
            className="btn btn-solve"
            disabled={isSolving}
          >
            Instant Solve
          </button>
        </div>
      </div>

      {/* Game Actions */}
      <div className="control-section">
        <h3>🎮 Actions</h3>
        <div className="action-buttons">
          <button onClick={onReset} className="btn btn-reset">
            Reset
          </button>
          <button onClick={onClear} className="btn btn-clear">
            Clear All
          </button>
          <button onClick={onCheck} className="btn btn-check">
            Check
          </button>
        </div>
      </div>

      {/* Help Controls */}
      <div className="control-section">
        <h3>💡 Help</h3>
        <div className="help-buttons">
          <button onClick={onHint} className="btn btn-hint">
            Get Hint
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default GameControls;