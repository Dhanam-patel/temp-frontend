import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useLeaves } from "@/hooks/use-leaves";
import { useEmployees } from "@/hooks/use-employees";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeaveSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = insertLeaveSchema.extend({
  employeeId: z.coerce.number(),
  daysAllocated: z.coerce.number()
});

export default function LeavesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { leaves, createLeave, updateLeaveStatus, isLoading } = useLeaves(isAdmin ? undefined : user?.id);
  const { employees } = useEmployees();
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: 0,
      type: "paid",
      startDate: "",
      endDate: "",
      reason: "",
      daysAllocated: 1,
      status: "pending"
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createLeave.mutate(data, {
      onSuccess: () => {
        setIsRequestOpen(false);
        form.reset();
      }
    });
  };

  const getEmployeeName = (id: number) => {
    return employees?.find(e => e.id === id)?.fullName || `Employee #${id}`;
  };

  const handleApprove = (id: number) => updateLeaveStatus.mutate({ id, status: 'approved' });
  const handleReject = (id: number) => updateLeaveStatus.mutate({ id, status: 'rejected' });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Time Off</h1>
          <p className="text-slate-500">Manage leave requests and balances.</p>
        </div>

        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="employeeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees?.map(emp => (
                          <SelectItem key={emp.id} value={String(emp.id)}>{emp.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl><Textarea placeholder="Brief reason..." {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRequestOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createLeave.isPending}>Submit Request</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading && <p>Loading...</p>}
        {leaves?.map(leave => (
          <div key={leave.id} className="card-premium p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {leave.daysAllocated}d
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{getEmployeeName(leave.employeeId)}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusChip status={leave.type} variant="info" />
                  <span className="text-sm text-slate-500">
                    {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                {leave.reason && <p className="text-sm text-slate-500 mt-2 italic">"{leave.reason}"</p>}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <StatusChip
                status={leave.status}
                variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'}
                className="text-sm px-3 py-1"
              />

              {isAdmin && leave.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(leave.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(leave.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
