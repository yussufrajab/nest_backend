'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { employeeService } from '../../../services/employeeService';
import type { Employee } from '../../../types/employee';
import { authService } from '../../../services/auth.service';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Briefcase,
  Users,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

const employeeStatuses = [
  'On Probation',
  'Confirmed',
  'On LWOP',
  'Retired',
  'Resigned',
  'Terminated',
  'Dismissed',
];

const getStatusBadgeVariant = (status: string): any => {
  switch (status) {
    case 'On Probation':
      return 'pending';
    case 'Confirmed':
      return 'approved';
    case 'On LWOP':
      return 'hro';
    case 'Retired':
    case 'Resigned':
      return 'default';
    case 'Terminated':
    case 'Dismissed':
      return 'rejected';
    default:
      return 'default';
  }
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadInstitutions();
    loadEmployees();
  }, [page, searchTerm, statusFilter, institutionFilter]);

  const loadInstitutions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/institutions?page=1&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions || []);
      }
    } catch (error) {
      console.error('Error loading institutions:', error);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    const params: any = { page, limit };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (institutionFilter) params.institutionId = institutionFilter;

    const result = await employeeService.getEmployees(params);
    setEmployees(result.employees);
    setTotal(result.total);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEmployees();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await employeeService.deleteEmployee(id);
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const canCreateEmployee = currentUser?.role === 'ADMIN' || currentUser?.role === 'HRO';
  const canEditEmployee = currentUser?.role === 'ADMIN' || currentUser?.role === 'HRO';
  const canDeleteEmployee = currentUser?.role === 'ADMIN';

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 mt-1">
            Manage and view all civil service employees
          </p>
        </div>
        {canCreateEmployee && (
          <Link href="/employees/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Employee
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-sm text-slate-500">Total Employees</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {employees.filter(e => e.status === 'On Probation').length || '...'}
            </p>
            <p className="text-sm text-slate-500">On Probation</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {employees.filter(e => e.status === 'Confirmed').length || '...'}
            </p>
            <p className="text-sm text-slate-500">Confirmed</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ZAN ID, or payroll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                           focus:border-primary-500 hover:border-slate-300 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         hover:border-slate-300 transition-all duration-200"
              >
                <option value="">All Statuses</option>
                {employeeStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={institutionFilter}
                onChange={(e) => {
                  setInstitutionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         hover:border-slate-300 transition-all duration-200"
              >
                <option value="">All Institutions</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setInstitutionFilter('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Loading employees...</p>
          </div>
        ) : employees?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No employees found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      ZAN ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {employee.profileImageUrl ? (
                            <img
                              src={employee.profileImageUrl}
                              alt={employee.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                              {employee.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-800">{employee.name}</div>
                            <div className="text-xs text-slate-500">{employee.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {employee.zanId}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {employee.institution?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {employee.department || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(employee.status || 'On Probation')}>
                          {employee.status || 'On Probation'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/employees/${employee.id}`)}
                          >
                            View
                          </Button>
                          {canEditEmployee && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/employees/${employee.id}/edit`)}
                            >
                              Edit
                            </Button>
                          )}
                          {canDeleteEmployee && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => handleDelete(employee.id, employee.name)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
