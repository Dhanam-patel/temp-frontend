import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService, EmployeeCreate } from "@/services/employee";
import { useToast } from "@/hooks/use-toast";

export function useEmployees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ["/employees"],
    queryFn: async () => {
      const data = await employeeService.getAll();
      // Map backend Employee to a friendly format if needed, but for now return as is
      // Frontend components might need adjustment if they expect different field names
      // Backend: job_title, department
      // Frontend Schema: jobTitle, department
      return data.map(emp => ({
        ...emp,
        id: emp.id,
        full_name: emp.user?.full_name || "Unknown",
        email: emp.user?.email || "",
        role: emp.user?.role || "employee",
        job_title: emp.job_title,
        department: emp.department,
        photo_url: emp.profile_picture_url,
        current_status: emp.current_status || "ABSENT",
      }));
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeCreate) => {
      return await employeeService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/employees"] });
      toast({ title: "Success", description: "Employee added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: "Failed to create employee", variant: "destructive" });
    },
  });

  return {
    employees,
    isLoading,
    error,
    createEmployee,
    refetch,
  };
}

export function useEmployee(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ["/employees", id],
    queryFn: async () => {
      if (!id) return null;
      const emp = await employeeService.getById(id);
      return {
        ...emp,
        id: emp.id,
        full_name: emp.user?.full_name,
        email: emp.user?.email,
        job_title: emp.job_title,
        department: emp.department,
        photo_url: emp.profile_picture_url,
        current_status: emp.current_status || "ABSENT",
      };
    },
    enabled: !!id,
  });

  const updateEmployee = useMutation({
    mutationFn: async (data: any) => {
      // Backend EmployeeUpdate schema: job_title, department, address, profile_picture_url
      // We'll need a specific update method in service if not just attendance
      // For now, assume this is unused or I'll add strict typing later
      throw new Error("Update not fully implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/employees", id] });
      queryClient.invalidateQueries({ queryKey: ["/employees"] });
      toast({ title: "Updated", description: "Employee details updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update employee", variant: "destructive" });
    },
  });

  return {
    employee,
    isLoading,
    error,
    updateEmployee,
  };
}

export function useEmployeePrivateInfo(id: string | number) {
  return useQuery({
    queryKey: ["/employees", id, "private-info"],
    queryFn: async () => {
      if (!id) return null;
      return await employeeService.getPrivateInfo(id);
    },
    enabled: !!id,
  });
}

export function useEmployeeSalary(id: string | number) {
  return useQuery({
    queryKey: ["/employees", id, "salary"],
    queryFn: async () => {
      if (!id) return null;
      return await employeeService.getSalary(id);
    },
    enabled: !!id,
  });
}
