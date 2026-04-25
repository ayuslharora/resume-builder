import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FullscreenProtectedRoute from "./components/auth/FullscreenProtectedRoute";
import Loading from "./pages/Loading";

const Landing  = lazy(() => import("./pages/Landing"));
const Login    = lazy(() => import("./pages/Login"));
const Signup   = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Resumes  = lazy(() => import("./pages/Resumes"));
const Resources = lazy(() => import("./pages/Resources"));
const Builder  = lazy(() => import("./pages/Builder"));
const Export   = lazy(() => import("./pages/Export"));
const Grader   = lazy(() => import("./pages/Grader"));
const Profile  = lazy(() => import("./pages/Profile"));

const NotFound = () => <div className="p-10">404 - Not Found</div>;

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/resumes", element: <Resumes /> },
      { path: "/resources", element: <Resources /> },
      { path: "/builder/:resumeId", element: <Builder /> },
      { path: "/grader", element: <Grader /> },
      { path: "/profile", element: <Profile /> }
    ]
  },
  {
    // Full-screen routes — auth-gated but NO sidebar / padding wrapper
    element: <FullscreenProtectedRoute />,
    children: [
      { path: "/export/:resumeId", element: <Export /> },
    ]
  },
  { path: "*", element: <NotFound /> }
]);

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}

