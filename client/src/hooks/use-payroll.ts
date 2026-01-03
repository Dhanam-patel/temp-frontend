import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function usePayroll(employeeId?: number) {
  const queryKey = [api.payroll.list.path, employeeId ? { employeeId } : undefined];
  const fetchUrl = employeeId 
    ? `${api.payroll.list.path}?employeeId=${employeeId}` 
    : api.payroll.list.path;

  const { data: payroll, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(fetchUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch payroll");
      return api.payroll.list.responses[200].parse(await res.json());
    },
  });

  return {
    payroll,
    isLoading,
  };
}
