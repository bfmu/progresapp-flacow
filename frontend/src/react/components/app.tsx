import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React, { useMemo, lazy, Suspense } from "react";
import LayoutReact from "./LayoutReact";
import Loading from "./Loading";
import ErrorFallback from "./ErrorFallback";
import Login from "../pages/Login";
import Register from "../pages/SignupForm";
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Profile = lazy(() => import("./Profile"));
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../../store/auth";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { getAppTheme } from "../theme";
const Muscles = lazy(() => import("../pages/Muscles"));
const Exercises = lazy(() => import("../pages/Exercises"));
const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const LiftingHistoryPage = lazy(() => import("../pages/LiftingHistoryPage"));
import RoleRoute from "./RoleRoute";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

export const App = () => {
  const isAuth = useAuthStore((state) => state.isAuth);
  const themeMode = useAuthStore((state) => state.theme);
  // const toggleTheme = useAuthStore((state) => state.toggleTheme);

  // Definir la paleta de colores clara y oscura
  const lightPalette = {
    primary: {
      main: "#e3a765",
    },
    secondary: {
      main: "#fdd000",
    },
    background: {
      default: "#f2efe2",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#5d6d7c",
    },
  };

  const darkPalette = {
    primary: {
      main: "#e3a765",
    },
    secondary: {
      main: "#fdd000",
    },
    background: {
      default: "#000000",
      paper: "#5d6d7c",
    },
    text: {
      primary: "#f2efe2",
      secondary: "#e3a765",
    },
  };

  const theme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  const router = createBrowserRouter([
    {
      path: "app",
      element: <LayoutReact />,
      errorElement: <ErrorFallback />,
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
        {
          element: <ProtectedRoute isAllowed={isAuth} />,
          errorElement: <ErrorFallback />,
          children: [
            { path: "profile", element: <Profile /> },
            { path: "", element: <Dashboard /> },
            { path: "muscles", element: <Muscles /> },
            { path: "exercises", element: <Exercises /> },
            {
              element: <RoleRoute requiredRoles={["admin"]} />,
              children: [{ path: "settings/*", element: <AdminPanel /> }],
            },
            {
              path: "lifting-histories/exercises/:exerciseId",
              element: <LiftingHistoryPage />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
          <CssBaseline />
          <Suspense fallback={<Loading />}>
            <RouterProvider router={router} />
          </Suspense>
        </SnackbarProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};
