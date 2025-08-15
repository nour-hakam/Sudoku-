// App.tsx - The main component of our application

import React from 'react';
import './App.css';
import SudokuBoard from './components/SudokuBoard';

// This is the root component - everything starts here
function App() {
  return (
    <div className="App">
      <SudokuBoard />
    </div>
  );
}

export default App;