import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Hexagon, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Hexagon className="w-7 h-7 text-white fill-indigo-600 stroke-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Welcome to Dayflow</h1>
          <p className="text-slate-500 mt-2">Sign in to your employee portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl><Input placeholder="Enter your username" {...field} className="h-11 bg-zinc-50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Enter your password" {...field} className="h-11 bg-zinc-50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-lg font-medium shadow-md shadow-indigo-200" disabled={login.isPending}>
                  {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
                Create Company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
