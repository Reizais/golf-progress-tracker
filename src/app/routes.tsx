import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./components/dashboard";
import { StartRound } from "./components/start-round";
import { History } from "./components/history";
import { Layout } from "./components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "start-round", Component: StartRound },
      { path: "history", Component: History },
      { path: "stats", element: <Navigate to="/" replace /> },
    ],
  },
]);
