import { Layout } from "@/components/Layout";
import { usePayroll } from "@/hooks/use-payroll";
import { useEmployees } from "@/hooks/use-employees";
import { StatusChip } from "@/components/StatusChip";
import { Banknote, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PayrollPage() {
  const { payroll, isLoading } = usePayroll();
  const { employees } = useEmployees();

  const getEmployeeName = (id: number) => {
    return employees?.find(e => e.id === id)?.fullName || `Employee #${id}`;
  };

  const getDepartment = (id: number) => {
    return employees?.find(e => e.id === id)?.department || 'Unassigned';
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payroll</h1>
          <p className="text-slate-500">View payment history and status.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading payroll data...</div>
        ) : payroll?.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-zinc-300">
            <Banknote className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p>No payroll records found.</p>
          </div>
        ) : (
          payroll?.map((record) => (
            <div key={record.id} className="card-premium p-5 flex flex-col md:flex-row items-center justify-between gap-4 group">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    ${(record.amount / 100).toFixed(2)}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {getEmployeeName(record.employeeId)} • {getDepartment(record.employeeId)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto justify-between">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{record.month}</p>
                  <p className="text-xs text-slate-500">
                    {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'Pending'}
                  </p>
                </div>
                
                <StatusChip 
                  status={record.status} 
                  variant={record.status === 'paid' ? 'success' : 'warning'} 
                  className="px-4 py-1"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
