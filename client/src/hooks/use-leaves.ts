import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertLeave } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useLeaves(employeeId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = [api.leaves.list.path, employeeId ? { employeeId } : undefined];
  const fetchUrl = employeeId 
    ? `${api.leaves.list.path}?employeeId=${employeeId}` 
    : api.leaves.list.path;

  const { data: leaves, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(fetchUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leave requests");
      return api.leaves.list.responses[200].parse(await res.json());
    },
  });

  const createLeave = useMutation({
    mutationFn: async (data: InsertLeave) => {
      const res = await fetch(api.leaves.create.path, {
        method: api.leaves.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to request leave");
      return api.leaves.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
      toast({ title: "Submitted", description: "Leave request submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit leave request", variant: "destructive" });
    },
  });

  const updateLeaveStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.leaves.update.path, { id });
      const res = await fetch(url, {
        method: api.leaves.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update leave status");
      return api.leaves.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
      toast({ title: "Updated", description: "Leave status updated" });
    },
  });

  return {
    leaves,
    isLoading,
    createLeave,
    updateLeaveStatus,
  };
}
