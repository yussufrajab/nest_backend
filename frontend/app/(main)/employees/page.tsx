'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { employeeService } from '../../../services/employeeService';
import type { Employee } from '../../../types/employee';
import { authService } from '../../../services/auth.service';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadEmployees();
  }, [page, searchTerm]);

  const loadEmployees = async () => {
    setLoading(true);
    const result = await employeeService.getEmployees({ page, limit: 20, search: searchTerm });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600 mt-1">
              Total: {total} employee{total !== 1 ? 's' : ''}
            </p>
          </div>
          {canCreateEmployee && (
            <Link
              href="/employees/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Employee
            </Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, ZAN ID, or payroll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : employees?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No employees found</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ZAN ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ministry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {employee.profileImageUrl && (
                          <img
                            src={employee.profileImageUrl}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.zanId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.ministry || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {employee.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/employees/${employee.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      {canEditEmployee && (
                        <button
                          onClick={() => router.push(`/employees/${employee.id}/edit`)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteEmployee && (
                        <button
                          onClick={() => handleDelete(employee.id, employee.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
