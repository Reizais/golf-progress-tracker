import { Outlet, Link, useLocation } from "react-router";
import { Home, Plus, History } from "lucide-react";
import { Button } from "./ui/button";

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-foreground tracking-wide">Golf Progress Tracker</h1>
            <Link to="/start-round">
              <Button size="sm">
                <Plus className="size-4 mr-2" />
                Start Round
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link to="/" className="flex-1">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="w-full flex flex-col items-center gap-1 h-auto py-2"
              >
                <Home className="size-5" />
                <span className="text-xs">Dashboard</span>
              </Button>
            </Link>
            <Link to="/history" className="flex-1">
              <Button
                variant={isActive("/history") ? "default" : "ghost"}
                className="w-full flex flex-col items-center gap-1 h-auto py-2"
              >
                <History className="size-5" />
                <span className="text-xs">History</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
