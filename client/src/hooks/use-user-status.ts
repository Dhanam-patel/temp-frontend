import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { getSocket } from "@/lib/socket"; // Socket unlikely supported by python backend yet
import { useToast } from "@/hooks/use-toast";
import { employeeService } from "@/services/employee";

interface UserStatus {
    id: string; // UUID
    full_name: string;
    email: string;
    current_status: "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY";
    last_check_in: Date | null;
    last_check_out: Date | null;
}

export function useUserStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [statuses, setStatuses] = useState<Map<string, UserStatus>>(new Map());

    // Fetch all user statuses by deriving from Employee list
    const { data: statusData, isLoading } = useQuery<UserStatus[]>({
        queryKey: ["user-statuses"],
        queryFn: async () => {
            const employees = await employeeService.getAll();
            return employees.map(emp => {
                let status: any = "ABSENT";
                if (emp.check_in_time && !emp.check_out_time) {
                    status = "PRESENT";
                }

                return {
                    id: emp.id,
                    full_name: emp.user?.full_name || "Unknown",
                    email: emp.user?.email || "",
                    current_status: status,
                    last_check_in: emp.check_in_time ? new Date() : null, // Simplified
                    last_check_out: emp.check_out_time ? new Date() : null,
                };
            });
        },
        refetchInterval: 30000,
    });

    // Update local state when data changes
    useEffect(() => {
        if (statusData) {
            const newMap = new Map<string, UserStatus>();
            statusData.forEach(status => newMap.set(status.id, status));
            setStatuses(newMap);
        }
    }, [statusData]);

    // WebSocket logic removed as python backend likely doesn't support the same socket events yet

    // Reuse employeeService for check in/out if needed, but this hook seems to expose mutation wrappers
    // For now, let's just leave the mutations as no-ops or wire them to employeeService if intended for current user
    // The previous implementation used /api/attendance/check-in with userId.
    // We'll leave them blank or throw error as this hook is mostly for *viewing* status in the list.

    const checkInMutation = useMutation({
        mutationFn: async () => await employeeService.checkIn(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-statuses"] });
            toast({ title: "Checked In" });
        }
    });

    const checkOutMutation = useMutation({
        mutationFn: async () => await employeeService.checkOut(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-statuses"] });
            toast({ title: "Checked Out" });
        }
    });

    return {
        statuses: Array.from(statuses.values()),
        isLoading,
        checkIn: () => checkInMutation.mutate(),
        checkOut: () => checkOutMutation.mutate(),
        isCheckingIn: checkInMutation.isPending,
        isCheckingOut: checkOutMutation.isPending,
    };
}
