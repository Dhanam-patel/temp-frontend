import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export function usePayroll(employeeId?: string) {
  const { data: payroll, isLoading } = useQuery({
    queryKey: ["/payroll", employeeId],
    queryFn: async () => {
      if (employeeId) {
        // Fetch payroll for specific employee (Admin/HR)
        const response = await api.get(`/payroll/employees/${employeeId}`);
        return response.data;
      } else {
        // Fetch payroll for current user
        const response = await api.get("/payroll/me");
        return response.data;
      }
    },
  });

  return {
    payroll,
    isLoading,
  };
}
