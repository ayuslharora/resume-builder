import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FullscreenProtectedRoute from "./components/auth/FullscreenProtectedRoute";
import AppErrorBoundary from "./components/errors/AppErrorBoundary";
import RouteErrorScreen from "./components/errors/RouteErrorScreen";
import Loading from "./pages/Loading";

const Landing  = lazy(() => import("./pages/Landing"));
const Login    = lazy(() => import("./pages/Login"));
const Signup   = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Resources = lazy(() => import("./pages/Resources"));
const Builder  = lazy(() => import("./pages/Builder"));
const Export   = lazy(() => import("./pages/Export"));
const Grader   = lazy(() => import("./pages/Grader"));
const Profile  = lazy(() => import("./pages/Profile"));
const PublicResume = lazy(() => import("./pages/PublicResume"));
const CoverLetter = lazy(() => import("./pages/CoverLetter"));
const Templates = lazy(() => import("./pages/Templates"));
const GraderInfo = lazy(() => import("./pages/GraderInfo"));
const Pricing = lazy(() => import("./pages/Pricing"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const HelpDocs = lazy(() => import("./pages/HelpDocs"));

const NotFound = () => <div className="p-10">404 - Not Found</div>;

const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorScreen />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/templates", element: <Templates /> },
      { path: "/grader-info", element: <GraderInfo /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/resources", element: <Resources /> },
          { path: "/builder/:resumeId", element: <Builder /> },
          { path: "/grader", element: <Grader /> },
          { path: "/profile", element: <Profile /> },
          { path: "/whats-new", element: <WhatsNew /> },
          { path: "/help", element: <HelpDocs /> },
        ]
      },
      {
        // Full-screen routes — auth-gated but NO sidebar / padding wrapper
        element: <FullscreenProtectedRoute />,
        children: [
          { path: "/export/:resumeId", element: <Export /> },
          { path: "/cover-letter/:resumeId", element: <CoverLetter /> },
          { path: "/shared/:token", element: <PublicResume /> },
        ]
      },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <AppErrorBoundary>
        <Suspense fallback={<Loading />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppErrorBoundary>
    </AuthProvider>
  );
}
