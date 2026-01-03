import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, LoginRequest } from "@shared/schema";
import { authService } from "@/services/auth";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: UseMutationResult<any, Error, LoginRequest>;
  logout: UseMutationResult<void, Error, void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const payload = parseJwt(token);
        if (!payload || !payload.sub) {
          throw new Error("Invalid token");
        }

        const userId = payload.sub;

        // 1. Fetch User Config/Role
        const userRes = await api.get(`/users/${userId}`);
        const userData = userRes.data;

        // 2. Fetch Employee Profile (if exists)
        // Since there is no direct link, we'll try to find an employee with this user_id.
        // Optimization: For now, fetch list and find. Ideal: Backend endpoint.
        let employeeData = null;
        try {
          // Attempt to find my employee record. 
          // Note: If the list is huge, this is bad. But assuming start-up scale.
          const employeeRes = await api.get('/employees/');
          const employees = employeeRes.data;
          employeeData = employees.find((e: any) => e.user.id === userId);
        } catch (e) {
          console.log("Could not fetch employees or match user", e);
        }

        // 3. Merge into Frontend User Shape
        return {
          id: userData.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          company: userData.company,
          phone: userData.phone,

          // Employee Fields
          job_title: employeeData?.job_title || "Staff",
          department: employeeData?.department || "General",
          address: employeeData?.address,
          profile_picture_url: employeeData?.profile_picture_url,

          // check times
          check_in_time: employeeData?.check_in_time,
          check_out_time: employeeData?.check_out_time,

          created_at: new Date(userData.created_at),
          updated_at: new Date(userData.updated_at),
        } as any; // Using any for now to avoid strict schema mismatches during refactor

      } catch (e) {
        console.error("Auth Fetch Error", e);
        localStorage.removeItem("token");
        return null;
      }
    },
    retry: false,
  });

  const login = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await authService.login(credentials.username, credentials.password);
      return response;
    },
    onSuccess: (data: any) => {
      localStorage.setItem("token", data.access_token);
      // Invalidate to trigger queryFn above
      api.defaults.headers.Authorization = `Bearer ${data.access_token}`; // Set immediate header
      toast({
        title: "Login successful",
      });
      // Force refetch to populate user state
      window.location.href = "/";
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : "Invalid credentials";
      toast({
        title: "Login failed",
        variant: "destructive",
        description: message,
      });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("token");
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/login");
      window.location.reload();
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
