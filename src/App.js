// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Component/Home/Dashboard.tsx'
import Learning from './Component/Learning/Learning.tsx';
import Classroom from './Component/Class/class.tsx';
import Game from './Component/game/game.tsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/learning" element={<Learning />} />
        <Route path='/classroom' element={<Classroom />} />
        <Route path='/game' element={<Game/>}/>
      </Routes>
    </Router>
  );
}

export default App;
