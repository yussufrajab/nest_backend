'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, type User } from '../../../../services/adminService';
import { authService } from '../../../../services/auth.service';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const currentUser = authService.getCurrentUser();
  const canManage = currentUser?.role === 'ADMIN';

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    if (!canManage) return;
    setLoading(true);
    try {
      const result = await adminService.getUsers({
        role: roleFilter || undefined,
        limit: 50,
      });
      console.log('loadUsers result:', result);
      setUsers(result?.users || []);
    } catch (error) {
      console.error('loadUsers error:', error);
      setUsers([]);
    }
    setLoading(false);
  };

  const handleToggleActive = async (id: string, currentActive: boolean, name: string) => {
    if (!confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} ${name}?`)) return;
    try {
      await adminService.updateUser(id, { active: !currentActive });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            {!loading && (
              <p className="text-gray-600 mt-1">
                Total: {users?.length || 0} user{users?.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link
            href="/admin/users/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add User
          </Link>
        </div>

        <div className="mb-6">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="HHRMD">HHRMD</option>
            <option value="HRO">HRO</option>
            <option value="HRMO">HRMO</option>
            <option value="DO">DO</option>
            <option value="EMP">Employee</option>
            <option value="PO">PO</option>
            <option value="CSCS">CSCS</option>
            <option value="HRRP">HRRP</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No users found</p>
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
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.institution?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user.id, user.active, user.name)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}/reset-password`)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
