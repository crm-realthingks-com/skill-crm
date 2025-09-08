import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/common/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Skills from "./pages/skills/Skills";
import Approvals from "./pages/approvals/Approvals";
import Projects from "./pages/projects/Projects";
import Reports from "./pages/reports/Reports";
import Admin from "./pages/admin/Admin";
import Notifications from "./pages/notifications/Notifications";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="skill-matrix-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/approvals" element={<Approvals />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/notifications" element={<Notifications />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
