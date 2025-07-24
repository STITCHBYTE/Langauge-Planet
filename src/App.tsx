import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FightGame from './Component/game/FightGame';
import FightingFriendsOnline from './Component/FightingGame/FightingFriends';
import AuthCallbackLogin from './Component/Login/AuthCallbackLogin';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FightGame />} />
        <Route path="/game/:roomId" element={<FightingFriendsOnline />} />
        <Route path="/auth-callback-login" element={<AuthCallbackLogin />} />
      </Routes>
    </Router>
  );
};

export default App;
