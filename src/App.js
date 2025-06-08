// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Component/Home/Dashboard.tsx'
import Learning from './Component/Learning/Learning.tsx';
import Classroom from './Component/Class/class.tsx';
import Game from './Component/game/game.tsx';
import FightingGame from './Component/FightingGame/FightingGame.tsx';
import './App.css';
import Login from './Component/Login/Login.tsx';
import TeacherClasses from './Teacher/Classes/classes.tsx';
import Profile from './Component/Login/Profile.tsx';
import FightingFriends from './Component/FightingGame/FightingFriends.tsx';
import CreateClass from './Teacher/Classes/NewClassCreate.tsx';
import Class_info_Page from './Teacher/Classes/Class_info_Page.jsx';
import Add_discussion from './Teacher/Classes/add-discussion.tsx';
import ADD_Assignment from './Teacher/Classes/edit_assigment.tsx';
import LandingPage from './LandingPage/LandingPage.tsx';
import StudentsPage from './Student/StudentsPage.tsx';
import AddStudents from './Student/AddStudentsPage.tsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/learning" element={<Learning />} />
        <Route path='/classroom' element={<Classroom />} />
        <Route path='/game' element={<Game/>}/>
        <Route path='/fighting-game' element={<FightingGame/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/teacher-classes" element={<TeacherClasses />} />
        <Route path="/fighting-friends/:roomCode" element={<FightingFriends />} />
        <Route path="/create-class" element={<CreateClass />} />
        <Route path="/Class_info_Page/:id" element={<Class_info_Page />} />
        <Route path="/add-discussion/:classId" element={<Add_discussion />} />
        <Route path="/add-assignment/:classroomId" element={<ADD_Assignment />} />
        <Route path="/students-page" element={<StudentsPage />} />
        <Route path="/add-students" element={<AddStudents />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
