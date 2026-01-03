import { useState } from "react";
import { Link } from "wouter";
import { useEmployees } from "@/hooks/use-employees";
import { employeeService } from "@/services/employee";
import { Layout } from "@/components/Layout";
import { Plus, Search, MoreVertical, Mail, Phone, Users, Copy, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import StatusIndicator from "@/components/StatusIndicator";
import { useUserStatus } from "@/hooks/use-user-status";

// Create employee form schema - only needs basic info
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  joiningDate: z.string().min(1, "Joining date is required"),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

export default function EmployeesList() {
  const { employees, isLoading, refetch } = useEmployees();
  const { toast } = useToast();
  const { statuses } = useUserStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ loginId: string; tempPassword: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      joiningDate: new Date().toISOString().split('T')[0], // Default to today
      jobTitle: "",
      department: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    try {
      // Generate a temporary password (simple random string)
      const tempPassword = Math.random().toString(36).slice(-8);

      const newEmployee = await employeeService.create({
        user: {
          full_name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: tempPassword,
          company: "Dayflow", // Default or fetch from current user context
          role: "employee"
        },
        job_title: data.jobTitle || "Employee",
        department: data.department || "General",
        date_of_joining: data.joiningDate,
        // addresses etc optional
      });

      // Show generated credentials
      // Backend Employee response includes user object but password is hashed.
      // We display the password we just generated.
      setGeneratedCredentials({
        loginId: data.email, // Login ID is email in this system
        tempPassword: tempPassword,
      });

      // Refresh employee list
      refetch();

      toast({
        title: "Employee created successfully",
        description: "Share the credentials with the new employee",
      });
    } catch (error: any) {
      // Backend might return detailed error
      const msg = error.response?.data?.detail || error.message || "Failed to create employee";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setGeneratedCredentials(null);
    form.reset();
  };

  const filteredEmployees = employees?.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Employees</h1>
          <p className="text-slate-500">Manage your team members and roles.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-display">
                {generatedCredentials ? "Employee Created!" : "Add New Employee"}
              </DialogTitle>
            </DialogHeader>

            {generatedCredentials ? (
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-semibold">Employee account created successfully!</p>
                  </div>
                  <p className="text-sm text-green-600">Share these credentials with the new employee.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Login ID</label>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-sm font-mono font-bold text-slate-900">{generatedCredentials.loginId}</code>
                      <button
                        onClick={() => copyToClipboard(generatedCredentials.loginId, "Login ID")}
                        className="p-1 hover:bg-zinc-200 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Temporary Password</label>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-sm font-mono font-bold text-slate-900">{generatedCredentials.tempPassword}</code>
                      <button
                        onClick={() => copyToClipboard(generatedCredentials.tempPassword, "Password")}
                        className="p-1 hover:bg-zinc-200 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Important:</strong> The employee will be required to change their password on first login.
                  </p>
                </div>

                <Button onClick={handleCloseDialog} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@company.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="joiningDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="jobTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title (Optional)</FormLabel>
                        <FormControl><Input placeholder="Software Engineer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department (Optional)</FormLabel>
                        <FormControl><Input placeholder="Engineering" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Employee"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search by name, role or department..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees?.map((employee) => (
            <Link key={employee.id} href={`/employees/${employee.id}`}>
              <div className="group card-premium p-6 cursor-pointer relative hover:border-indigo-200 hover:shadow-indigo-100">
                <div className="absolute top-4 right-4">
                  <button className="p-1 rounded-full hover:bg-zinc-100 text-slate-400">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mt-2">
                  <Avatar className="w-20 h-20 mb-4 border-4 border-indigo-50 group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={employee.photo_url || undefined} />
                    <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700">
                      {employee.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{employee.full_name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="text-indigo-600 font-medium text-sm">{employee.job_title || 'No Title'}</p>
                    {statuses.find(s => s.id === employee.id) && (
                      <StatusIndicator
                        status={statuses.find(s => s.email === employee.email)?.current_status || "ABSENT"}
                        size="sm"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium border border-zinc-200">
                      {employee.department || 'General'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium border border-zinc-200 capitalize">
                      {employee.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 w-full gap-3 pt-4 border-t border-zinc-100">
                    <button className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredEmployees?.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No employees found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search terms or add a new employee.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
