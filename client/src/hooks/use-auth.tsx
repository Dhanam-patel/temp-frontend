import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, LoginRequest } from "@shared/schema";
import { api } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: UseMutationResult<User, Error, LoginRequest>;
  logout: UseMutationResult<void, Error, void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/me"], // Note: Backend route for this will be added if needed, but for now we rely on login success state
    queryFn: async () => {
      // Placeholder for session check
      return null;
    },
    retry: false,
  });

  const login = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await apiRequest("POST", api.auth.login.path, credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/me"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      // In a real app, this would hit /api/logout
      queryClient.setQueryData(["/api/me"], null);
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/login");
    },
  });

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
