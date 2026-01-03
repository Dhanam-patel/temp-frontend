import { useState } from "react";
import { Link } from "wouter";
import { useEmployees } from "@/hooks/use-employees";
import { Layout } from "@/components/Layout";
import { Plus, Search, MoreVertical, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// Create employee form schema
const formSchema = insertUserSchema;

export default function EmployeesList() {
  const { employees, isLoading, createEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "password123", // Default for demo
      fullName: "",
      email: "",
      role: "employee",
      jobTitle: "",
      department: "",
      phone: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createEmployee.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
    });
  };

  const filteredEmployees = employees?.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <DialogContent className="max-w-2xl rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-display">Add New Employee</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@company.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input placeholder="johndoe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="+1 234 567 890" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="jobTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl><Input placeholder="Software Engineer" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl><Input placeholder="Engineering" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createEmployee.isPending}>
                    {createEmployee.isPending ? "Creating..." : "Create Employee"}
                  </Button>
                </div>
              </form>
            </Form>
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
                    <AvatarImage src={employee.photoUrl || undefined} />
                    <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700">
                      {employee.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{employee.fullName}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-4">{employee.jobTitle || 'No Title'}</p>
                  
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
