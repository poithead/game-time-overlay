import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Auth from "./pages/Auth";
import MyGames from "./pages/MyGames";
import ControlPanel from "./pages/ControlPanel";
import Overlay from "./pages/Overlay";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : <Auth />;
}

// Init app theme on mount
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useProfile(user?.id);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthRoute />} />
            {/* My Games (landing page) – uses app_theme via useProfile */}
            <Route path="/dashboard" element={<ProtectedRoute><MyGames /></ProtectedRoute>} />
            {/* Control Panel – uses app_theme via useProfile */}
            <Route path="/control/:gameId" element={<ProtectedRoute><ControlPanel /></ProtectedRoute>} />
            {/* Overlay – uses scoreboard_theme, isolated from global dark class */}
            <Route path="/overlay/:gameId" element={<Overlay />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
