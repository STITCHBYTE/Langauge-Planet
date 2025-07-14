import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FightGame from './Component/game/FightGame';
import FightingFriendsOnline from './Component/FightingGame/FightingFriends';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FightGame />} />
        <Route path="/game/:roomId" element={<FightingFriendsOnline />} />
      </Routes>
    </Router>
  );
};

export default App;
