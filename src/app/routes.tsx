import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./components/dashboard";
import { StartRound } from "./components/start-round";
import { History } from "./components/history";
import { Layout } from "./components/layout";
import { AuthPage } from "./components/AuthPage";
import { useAuth } from "./context/AuthContext";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "start-round", Component: StartRound },
      { path: "history", Component: History },
      { path: "stats", element: <Navigate to="/" replace /> },
    ],
  },
]);
