import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertAttendance } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAttendance(employeeId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Construct query params if employeeId is present
  const queryKey = [api.attendance.list.path, employeeId ? { employeeId } : undefined];
  const fetchUrl = employeeId 
    ? `${api.attendance.list.path}?employeeId=${employeeId}` 
    : api.attendance.list.path;

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(fetchUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });

  const createAttendance = useMutation({
    mutationFn: async (data: InsertAttendance) => {
      const res = await fetch(api.attendance.create.path, {
        method: api.attendance.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record attendance");
      return api.attendance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      toast({ title: "Success", description: "Attendance recorded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record attendance", variant: "destructive" });
    },
  });

  return {
    attendanceRecords,
    isLoading,
    createAttendance,
  };
}
