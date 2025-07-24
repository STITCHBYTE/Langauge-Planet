# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Langauge-Planet

A comprehensive web platform for classroom management, assignments, discussions, and integration with Google Classroom. Built with React and Node.js.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [APIs Used](#apis-used)
- [Key Features](#key-features)
- [Deployment](#deployment)
- [Learn More](#learn-more)

---

## Project Overview

Langauge-Planet is designed to help teachers and students manage classes, assignments, discussions, and reports. It supports integration with Google Classroom for seamless grade and assignment syncing.

---

## Available Commands

| Command                | Description                                                      |
|------------------------|------------------------------------------------------------------|
| `npm start`            | Runs the app in development mode at [http://localhost:3000](http://localhost:3000) |
| `npm run server`       | Starts the backend server (Node.js, for game features)           |
| `npm run dev`          | Runs both frontend and backend concurrently                      |
| `npm run build`        | Builds the app for production to the `build` folder              |
| `npm test`             | Launches the test runner in interactive watch mode               |
| `npm run eject`        | Ejects the app for full configuration control                    |

---

## Project Structure

```
Learning-Planet/
├── .env
├── .gitignore
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── README.md
├── build/
│   └── ... (production build files)
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   ├── kenney_car-kit/
│   │   ├── Models/
│   │   ├── Overview.html
│   │   ├── License.txt
│   │   └── View Documentation.url
│   ├── kenney_racing-kit/
│   │   ├── Models/
│   │   ├── License.txt
│   │   └── Instructions.url
│   └── ... (other static assets)
├── src/
│   ├── App.js
│   │   - Main app routing and context setup.
│   ├── config.js
│   │   - Exports Server_url for API endpoints.
│   ├── index.js
│   ├── Admin/
│   │   ├── Dashboard.tsx
│   │   ├── LanguagesPage.tsx
│   │   ├── StudentAdmin.tsx
│   │   ├── TeacherAdmin.tsx
│   │   ├── coupons.tsx
│   │   └── LessonAdmin/
│   │       ├── Admin_Add_Stage.tsx
│   │       ├── Admin_Add_lesson.tsx
│   │       ├── Admin_Edit_lesson.tsx
│   │       ├── Admin_LessonReport.tsx
│   │       ├── Admin_Lesson_view.tsx
│   │       ├── Admin_View_student.tsx
│   │       └── Admin_lessonDisplay.tsx
│   ├── Component/
│   │   ├── Class/
│   │   │   ├── Disscussion-submit.tsx
│   │   │   │   - Uses: `/api/classrooms/classroom/:classId/discussions/` (fetch discussions)
│   │   │   │   - Uses: `/api/classrooms/assignment-submissions/` (submit assignments)
│   │   │   └── classes.tsx
│   │   │       - Uses: `/api/classrooms/classroom/:classId/` (fetch class info)
│   │   │       - Uses: `/api/classrooms/classroom/:classId/assignments/` (fetch assignments)
│   │   │       - Uses: `/api/classrooms/classroom/:classId/discussions/` (fetch discussions)
│   │   ├── Home/
│   │   │   ├── JoinedClassesSection.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── WeeklyStatsSection.tsx
│   │   │       - Uses: `/api/lessons/lesson/:lessonId/report/` (fetch weekly stats)
│   │   ├── Learning/
│   │   │   ├── StudentLesson.tsx
│   │   │   │   - Uses: `/api/lessons/lesson/:lessonId/` (fetch lesson details)
│   │   │   ├── LessonStudentStage.tsx
│   │   │   │   - Uses: `/api/lessons/lesson/:lessonId/stages/` (fetch lesson stages)
│   │   │   └── quizzesSubmission.tsx
│   │   │       - Uses: `/api/classrooms/assignment-submissions/` (submit quiz answers)
│   │   └── game/
│   │       ├── CarGame/
│   │       │   └── carGame.tsx
│   │       └── CarSelectionOnline/
│   │           └── carGameOnline.tsx
│   ├── Context/
│   │   └── ViewContext.tsx
│   ├── LandingPage/
│   │   └── LandingPage.tsx
│   ├── Student/
│   │   ├── AddStudentsPage.tsx
│   │   ├── StudentsPage.tsx
│   │   └── studentInfoPage.tsx
│   ├── Teacher/
│   │   ├── Classes/
│   │   │   ├── Class_info_Page.jsx
│   │   │   │   - Uses: `/api/classrooms/classroom/:classId/` (fetch class info)
│   │   │   │   - Uses: `/api/classrooms/classroom/:classId/enrolled-students/` (fetch students)
│   │   │   ├── NewClassCreate.tsx
│   │   │   │   - Uses: `/api/classrooms/classroom/` (create new class)
│   │   │   ├── Reports.tsx
│   │   │   │   - Uses: `/api/classrooms/classroom/:classId/assignment-submissions/` (fetch submissions)
│   │   │   │   - Uses: Google Classroom API for grade sync
│   │   │   ├── addAssigment.tsx
│   │   │   │   - Uses: `/api/classrooms/classroom/:classId/assignments/` (add assignment)
│   │   │   ├── discussionForms.tsx
│   │   │   │   - Uses: `/api/classrooms/classroom/:classId/discussions/` (manage discussions)
│   │   │   ├── edit-discussion.tsx
│   │   │   └── StudentsPage.jsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── Lesson/
│   │   │   ├── Add_Quiz.tsx
│   │   │   ├── Add_Stage.tsx
│   │   │   ├── Add_lesson.tsx
│   │   │   ├── Edit_lesson.tsx
│   │   │   ├── LessonReport.tsx
│   │   │   │   - Uses: `/api/lessons/lesson/:lessonId/report/` (fetch lesson report)
│   │   │   ├── Lesson_view.tsx
│   │   │   ├── View_student.tsx
│   │   │   └── lessonDisplay.tsx
└── ...
```

**API Usage by File (src/):**

- **`src/Component/Class/classes.tsx`**  
  - `/api/classrooms/classroom/:classId/` — Fetch class info  
  - `/api/classrooms/classroom/:classId/assignments/` — Fetch assignments  
  - `/api/classrooms/classroom/:classId/discussions/` — Fetch discussions  
  - `/api/classrooms/classroom/:classId/my-assignment-submissions/` — Fetch user submissions

- **`src/Component/Class/Disscussion-submit.tsx`**  
  - `/api/classrooms/classroom/:classId/discussions/` — Fetch and submit discussion answers  
  - `/api/classrooms/assignment-submissions/` — Submit assignment answers

- **`src/Component/Home/WeeklyStatsSection.tsx`**  
  - `/api/lessons/lesson/:lessonId/report/` — Fetch weekly stats for dashboard

- **`src/Component/Learning/StudentLesson.tsx`**  
  - `/api/lessons/lesson/:lessonId/` — Fetch lesson details

- **`src/Component/Learning/LessonStudentStage.tsx`**  
  - `/api/lessons/lesson/:lessonId/stages/` — Fetch lesson stages

- **`src/Component/Learning/quizzesSubmission.tsx`**  
  - `/api/classrooms/assignment-submissions/` — Submit quiz answers

- **`src/Teacher/Classes/Class_info_Page.jsx`**  
  - `/api/classrooms/classroom/:classId/` — Fetch class info  
  - `/api/classrooms/classroom/:classId/enrolled-students/` — Fetch enrolled students

- **`src/Teacher/Classes/NewClassCreate.tsx`**  
  - `/api/classrooms/classroom/` — Create new class

- **`src/Teacher/Classes/Reports.tsx`**  
  - `/api/classrooms/classroom/:classId/assignment-submissions/` — Fetch assignment submissions  
  - Google Classroom API — Sync grades and fetch Google Classroom data

- **`src/Teacher/Classes/addAssigment.tsx`**  
  - `/api/classrooms/classroom/:classId/assignments/` — Add new assignment

- **`src/Teacher/Classes/discussionForms.tsx`**  
  - `/api/classrooms/classroom/:classId/discussions/` — Manage class discussions

- **`src/Teacher/Lesson/LessonReport.tsx`**  
  - `/api/lessons/lesson/:lessonId/report/` — Fetch lesson report

---

**Note:**  
- All API endpoints are typically prefixed with the base URL from [`src/config.js`](src/config.js).
- Google Classroom API is used for integration and grade syncing in [`src/Teacher/Classes/Reports.tsx`](src/Teacher/Classes/Reports.tsx).

For more details, see the respective files in the [src/](src/)
