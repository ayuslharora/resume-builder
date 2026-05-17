import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
const Contact = lazy(() => import("./pages/Contact"));

const NotFound = () => <div className="p-10">404 - Not Found</div>;

function AppRoot() {
  const location = useLocation();
  
  useEffect(() => {
    const publicRoutes = ["/", "/templates", "/pricing", "/contact", "/grader-info", "/login", "/signup", "/whats-new", "/help"];
    const isPublic = publicRoutes.includes(location.pathname) || location.pathname.startsWith("/shared/");
    const savedTheme = localStorage.getItem("app-theme");

    if (savedTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }
    
    if (isPublic) {
      document.body.removeAttribute("data-accent");
    } else {
      const savedAccent = localStorage.getItem("app-accent");
      if (savedAccent === "mono") {
        document.body.setAttribute("data-accent", "mono");
      } else {
        document.body.removeAttribute("data-accent");
      }
    }
  }, [location.pathname]);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <AppRoot />,
    errorElement: <RouteErrorScreen />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/templates", element: <Templates /> },
      { path: "/grader-info", element: <GraderInfo /> },
      { path: "/grader/report/:reportToken", element: <Grader /> },
      { path: "/shared/:token", element: <PublicResume /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/contact", element: <Contact /> },
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
