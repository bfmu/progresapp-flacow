import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React, { useMemo } from "react";
import Login from "../pages/Login";
import LayoutReact from "./LayoutReact";
import Register from "../pages/SignupForm";
import Dashboard from "../pages/Dashboard";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../../store/auth";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Muscles from "../pages/Muscles";
import Exercises from "../pages/Exercises";
import AdminPanel from "../pages/AdminPanel";
import LiftingHistoryPage from "../pages/LiftingHistoryPage";
import SignupForm from "../pages/SignupForm";

export const App = () => {
  const isAuth = useAuthStore((state) => state.isAuth);
  const themeMode = useAuthStore((state) => state.theme);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);

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

  const theme = useMemo(
    () =>
      createTheme({
        palette: themeMode === "dark" ? darkPalette : lightPalette,
      }),
    [themeMode]
  );

  const router = createBrowserRouter([
    {
      path: "app",
      element: <LayoutReact />,
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <SignupForm /> },
        {
          element: <ProtectedRoute isAllowed={isAuth} />, // Esto envuelve las rutas protegidas
          children: [
            { path: "profile", element: <Profile /> },
            { path: "", element: <Dashboard /> },
            { path: "muscles", element: <Muscles /> },
            { path: "exercises", element: <Exercises /> },
            { path: "settings/*", element: <AdminPanel /> },
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
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};
