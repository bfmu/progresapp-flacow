import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import Login from "../pages/Login";
import LayoutReact from "./LayoutReact";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../../store/auth";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from "@mui/material";
import Muscles from "../pages/Muscles";


export const App = () => {
  const isAuth = useAuthStore((state) => state.isAuth);
  const router = createBrowserRouter([
    {
      path: "app",
      element: <LayoutReact />,
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        {
          element: <ProtectedRoute isAllowed={isAuth} />, // Esto envuelve las rutas protegidas
          children: [
            { path: "profile", element: <Profile /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "muscles", element: <Muscles /> },
          ],
        },
      ],
    },
  ]);
  return (
    <React.StrictMode>
      <CssBaseline/>
      <RouterProvider router={router} />{" "}
    </React.StrictMode>
  );
};
