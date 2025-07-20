import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css'
import Login from './pages/login'
import MainLayout from "./layout/MainLayout";
import Navbar from './components/Navbar'
import HeroSection from './pages/student/HeroSection'
import Courses from "./pages/student/Courses";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Sidebar from "./pages/instructor/Sidebar";
import Dashboard from "./pages/instructor/Dashboard";
import CourseTable from "./pages/instructor/course/CourseTable";
import AddCourse from "./pages/instructor/course/AddCourse";
import EditCourse from "./pages/instructor/course/EditCourse";
import CreateLecture from "./pages/instructor/lecture/CreateLecture";
import EditLecture from "./pages/instructor/lecture/EditLecture";
import ApplyInstructor from "./pages/student/ApplyInstructor";
import CourseDetail from "./pages/student/CourseDetail";
import SearchPage from "./pages/student/SearchPage";
import CourseProgress from "./pages/student/courseProgress";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin components
import AdminSidebar from "./pages/admin/Sidebar";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/Applications";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "my-learning",
        element: <ProtectedRoute><MyLearning /></ProtectedRoute>
      },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: "course-detail/:courseId",
        element: (
          <CourseDetail />
        ),
      },
      {
        path: "become-instructor",
        element: <ProtectedRoute requiredRole="student"><ApplyInstructor /></ProtectedRoute>
      },
      {
        path: "course/search",
        element: (

          <SearchPage />

        ),
      },

      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <CourseProgress />
          </ProtectedRoute>
        ),
      },
      // instructor routes start from here
      {
        path: "instructor",
        element: <ProtectedRoute requiredRole="instructor"><Sidebar /></ProtectedRoute>,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />
          },
          {
            path: "course",
            element: <CourseTable />
          },
          {
            path: "course/create",
            element: <AddCourse />
          },
          {
            path: "course/:courseId",
            element: <EditCourse />
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
        ]
      },

      // admin routes
      {
        path: "admin",
        element: <ProtectedRoute requiredRole="admin"><AdminSidebar /></ProtectedRoute>,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />
          },
          {
            path: "applications",
            element: <AdminApplications />
          },
          {
            path: "users",
            element: <AdminUsers />
          },
          {
            path: "settings",
            element: <AdminSettings />
          },
        ]
      }


    ],

  },
]);


function App() {
  return (
    <main>
      <ThemeProvider>
        <RouterProvider router={appRouter} />
      </ThemeProvider>
    </main>
  )
}

export default App