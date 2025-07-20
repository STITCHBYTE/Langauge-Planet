// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import EditAssignment from './Teacher/Classes/addAssigment.tsx';
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
import { useView } from './Context/ViewContext.tsx';
import StudentsInfo from "./Student/studentInfoPage.tsx";
import TeacherDashboard from './Teacher/Dashboard/Dashboard.tsx';
import EndrolledStudents from './Teacher/Classes/StudentsPage.jsx';
import StudentClasses from '../src/Component/Class/classes.tsx';
import StudentDisscussion from '../src/Component/Class/Disscussion-submit.tsx';
import DiscussionForum from '../src/Teacher/Classes/discussionForms.tsx';
import Reports from './Teacher/Classes/Reports.tsx';
import ViewStudent from './Teacher/Lesson/View_student.tsx';
import AuthCallback from "./Component/Login/AuthCallback";
import StudentLesson from './Component/Learning/StudentLesson.tsx';
import LessonStudentStage from './Component/Learning/LessonStudentStage.tsx';
import AdminDashboard from './Admin/Dashboard.tsx';
import LanguagesPage from './Admin/LanguagesPage.tsx';
import StudentAdmin from './Admin/StudentAdmin.tsx';
import TeacherAdmin from './Admin/TeacherAdmin.tsx';
import { ToastContainer } from 'react-toastify';
import CouponPage from './Admin/coupons.tsx';      
import LessonReport from './Teacher/Lesson/LessonReport.tsx';  
import Admin_Add_lesson from './Admin/LessonAdmin/Admin_Add_lesson.tsx';
import Admin_Edit_lesson from './Admin/LessonAdmin/Admin_Edit_lesson.tsx';
import Admin_Lesson_view from './Admin/LessonAdmin/Admin_Lesson_view.tsx';
import Admin_lessonDisplay from './Admin/LessonAdmin/Admin_lessonDisplay.tsx';
import Admin_LessonReport from './Admin/LessonAdmin/Admin_LessonReport.tsx';
import Admin_View_student from './Admin/LessonAdmin/Admin_View_student.tsx';
import Admin_Add_Stage from './Admin/LessonAdmin/Admin_Add_Stage.tsx';
import Admin_Add_Quiz from './Admin/LessonAdmin/Admin_Add_Quiz.tsx';
function App() {
  const AppRoutes = () => {
    const { currentUser } = useView();
    const location = useLocation();
    const isSuperUser = currentUser?.is_superuser;
    console.log("currentUser:", currentUser);
    return (
      <>
        <Routes>
          {/* Admin routes - only for superuser */}
          <Route path="/admin/dashboard" element={isSuperUser ? <AdminDashboard /> : <Navigate to="/" replace />} />
          <Route path="/admin/languages" element={isSuperUser ? <LanguagesPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/students" element={isSuperUser ? <StudentAdmin /> : <Navigate to="/" replace />} />
          <Route path="/admin/teachers" element={isSuperUser ? <TeacherAdmin /> : <Navigate to="/" replace />} />
          <Route path="/admin/coupons" element={isSuperUser ? <CouponPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/lesson/add" element={isSuperUser ? <Admin_Add_lesson /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/edit/:lesson_id" element={isSuperUser ? <Admin_Edit_lesson /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/view/:lesson_id" element={isSuperUser ? <Admin_Lesson_view /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/display" element={isSuperUser ? <Admin_lessonDisplay /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/report/:lessonId" element={isSuperUser ? <Admin_LessonReport /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/students/:lesson_id" element={isSuperUser ? <Admin_View_student /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/add-stage/:cc" element={isSuperUser ? <Admin_Add_Stage /> : <Navigate to="/" replace />} />
<Route path="/admin/lesson/add-quiz/:lesson_id" element={isSuperUser ? <Admin_Add_Quiz /> : <Navigate to="/" replace />} />

          {/* Catch-all for superuser: redirect any unmatched route to admin dashboard */}
          {isSuperUser && <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />}

          {/* Non-admin routes - hide for superuser */}
          {!isSuperUser && <>
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
            <Route path="/student-page/:studentId" element={<StudentsInfo />} />
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
            <Route path="/discussion-forum/:discussionId" element={<DiscussionForum />} /> {/* Add this new route */}
            <Route path="/reports/:classId" element={<Reports />} />
            <Route path="/lesson/:lesson_id/students" element={<ViewStudent />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/lesson/:lessonId" element={<StudentLesson />} />
            <Route path="/stage/:stageId" element={<LessonStudentStage />} />
            <Route path="/lesson-report/:lessonId" element={<LessonReport />} /> {/* New route for Lesson Report */}
          </>
          }
        </Routes>

        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
      </>
    );
  };

  // Use AppRoutes inside Router and ViewProvider
  return (
    <ViewProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ViewProvider>
  );
}

export default App;
