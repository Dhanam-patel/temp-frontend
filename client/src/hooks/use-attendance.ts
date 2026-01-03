import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export function useAttendance(employeeId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ["/attendance", employeeId],
    queryFn: async () => {
      if (employeeId) {
        // Viewing specific employee
        const response = await api.get(`/attendance/employees/${employeeId}`);
        return response.data;
      } else {
        // If we want a list of all (admin), OR just 'me' for regular user.
        // For simplicity, let's try /attendance/ first, fall back to /attendance/me if it fails or if not admin
        try {
          // If called without ID on Attendance page, we likely want the full list if admin
          const response = await api.get('/attendance/');
          return response.data;
        } catch (e) {
          return await employeeService.getAttendanceMe();
        }
      }
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      return await employeeService.checkIn();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/employees"] });
      toast({ title: "Checked In", description: "Your attendance has been recorded." });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : "Failed to check in";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      return await employeeService.checkOut();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/employees"] });
      toast({ title: "Checked Out", description: "Your checkout time has been recorded." });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : "Failed to check out";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  return {
    attendanceRecords,
    isLoading,
    checkIn: checkInMutation,
    checkOut: checkOutMutation,
  };
}
