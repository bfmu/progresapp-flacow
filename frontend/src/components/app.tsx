import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import Login from "./Login";
import LayoutReact from "./LayoutReact";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Profile from "./Profile";

const router = createBrowserRouter([
  {
    path: "app",
    element: <LayoutReact />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "dashborad", element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

export const App = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />{" "}
    </React.StrictMode>
  );
};
