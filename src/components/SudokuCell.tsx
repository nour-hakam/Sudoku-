// SudokuCell.tsx - Enhanced with validation highlighting

import React from 'react';
import './SudokuCell.css';

interface SudokuCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isFixed: boolean;
  isHighlighted?: boolean;     // For errors
  isConflicting?: boolean;      // NEW: For showing conflicts
  isSelected?: boolean;         // NEW: For showing selected cell
  possibleValues?: number[];    // NEW: For hint mode
  row: number;
  col: number;
  onFocus?: () => void;         // NEW: When cell is selected
}

const SudokuCell: React.FC<SudokuCellProps> = ({ 
  value, 
  onChange, 
  isFixed, 
  isHighlighted = false,
  isConflicting = false,
  isSelected = false,
  possibleValues = [],
  row,
  col,
  onFocus
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      onChange(null);
      return;
    }
    
    const num = parseInt(inputValue);
    if (num >= 1 && num <= 9) {
      onChange(num);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        
    // If it's a number key (1-9)
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault(); // Prevent default to control input
      onChange(parseInt(e.key));
    }
    // If it's delete or backspace
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onChange(null);
    }
  };

  return (
    <div className="cell-container">
      <input
        type="text"
        className={`sudoku-cell 
          ${isFixed ? 'fixed' : ''} 
          ${isConflicting ? 'conflicting' : ''}
          ${isHighlighted ? 'highlighted' : ''}
          ${isSelected ? 'selected' : ''}
          ${col % 3 === 2 && col !== 8 ? 'border-right' : ''}
          ${row % 3 === 2 && row !== 8 ? 'border-bottom' : ''}
        `}
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        disabled={isFixed}
        maxLength={1}
        inputMode="numeric"  // Mobile keyboard shows numbers
      />
      {/* Show possible values as small hints (optional feature) */}
      {!value && possibleValues.length > 0 && possibleValues.length <= 4 && (
        <div className="possible-values">
          {possibleValues.map(num => (
            <span key={num} className="hint-number">{num}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SudokuCell;