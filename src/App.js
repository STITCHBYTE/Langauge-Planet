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
import EditClass from './Teacher/Classes/edit-class.tsx';
import Class_info_Page from './Teacher/Classes/Class_info_Page.jsx';
import Add_discussion from './Teacher/Classes/add-discussion.tsx';
import ADD_Assignment from './Teacher/Classes/edit_assigment.tsx';
import EditDiscussion from './Teacher/Classes/edit-discussion.tsx';
import EditAssignment from './Teacher/Classes/assigment-edit.tsx';
import LandingPage from './LandingPage/LandingPage.tsx';
import StudentsPage from './Student/StudentsPage.tsx';
import AddStudents from './Student/AddStudentsPage.tsx';
import TeacherLessonDisplay from './Teacher/Lesson/lessonDisplay.tsx';
import AddLesson from './Teacher/Lesson/Add_lesson.tsx';
import EditLesson from './Teacher/Lesson/Edit_lesson.tsx';
import AddStage from './Teacher/Lesson/Add_Stage.tsx';
import AddQuiz from './Teacher/Lesson/Add_Quiz.tsx';
import LessonviewPage from './Teacher/Lesson/Lesson_view.tsx';
import { ViewProvider } from './Context/ViewContext.tsx'
import StudentsInfo from "./Student/studentInfoPage.tsx";
import TeacherDashboard from './Teacher/Dashboard/Dashboard.tsx';
import EndrolledStudents from './Teacher/Classes/StudentsPage.jsx';
import StudentClasses from '../src/Component/Class/classes.tsx';
import StudentDisscussion from '../src/Component/Class/Disscussion-submit.tsx';
import Reports from './Teacher/Classes/Reports.tsx';
import ViewStudent from './Teacher/Lesson/View_student.tsx';
function App() {
  return (
       <ViewProvider>
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
        <Route path="/edit-class/:classId" element={<EditClass />} />
        <Route path="/Class_info_Page/:id" element={<Class_info_Page />} />
        <Route path="/add-discussion/:classId" element={<Add_discussion />} />
        <Route path="/add-assignment/:classroomId" element={<ADD_Assignment />} />
        <Route path="/edit-discussion/:discussionId" element={<EditDiscussion />} />
        <Route path="/edit-assignment/:assignmentId" element={<EditAssignment />} />
        <Route path="/students-page" element={<StudentsPage />} />
        <Route path="/student-page/:classId" element={<StudentsInfo />} />
        <Route path="/add-students" element={<AddStudents />} />
        <Route path="/teacher-lesson-view" element={<TeacherLessonDisplay />} />
        <Route path="/lessons" element={<TeacherLessonDisplay />} />
        <Route path="/add-lesson" element={<AddLesson />} />
        <Route path="/edit-lesson/:lesson_id" element={<EditLesson />} />
        <Route path="/add-stage/:cc" element={<AddStage />} />
        <Route path="/add-quiz/:lesson_id" element={<AddQuiz />} />
        <Route path="/lesson-view/:lesson_id" element={<LessonviewPage />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/class/:classId/enrolled-students" element={<EndrolledStudents />} />
        <Route path="/classes/:classId/students" element={<StudentClasses />} />
        <Route path="/discussion/:discussionId" element={<StudentDisscussion />} />
        <Route path="/reports/:classId" element={<Reports />} />
        <Route path="/lesson/:lesson_id/students" element={<ViewStudent />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
    </ViewProvider>
  );
}

export default App;
