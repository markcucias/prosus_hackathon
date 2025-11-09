import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewAssignment from "./pages/NewAssignment";
import AssignmentDetail from "./pages/AssignmentDetail";
import SessionPage from "./pages/SessionPage";
import CalendarSync from "./pages/CalendarSync";
import DiagnosticPage from "./pages/DiagnosticPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/assignments/new" element={<NewAssignment />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/sessions/:id" element={<SessionPage />} />
          <Route path="/calendar-sync" element={<CalendarSync />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
