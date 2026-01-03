import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import EmployeesList from "@/pages/EmployeesList";
import EmployeeDetail from "@/pages/EmployeeDetail";
import AttendancePage from "@/pages/AttendancePage";
import LeavesPage from "@/pages/LeavesPage";
import PayrollPage from "@/pages/PayrollPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Protected Routes (Ideally wrapped in auth check) */}
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={EmployeesList} />
      <Route path="/employees/:id" component={EmployeeDetail} />
      <Route path="/attendance" component={AttendancePage} />
      <Route path="/leaves" component={LeavesPage} />
      <Route path="/payroll" component={PayrollPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
