'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, type Institution } from '../../../../services/adminService';
import { authService } from '../../../../services/auth.service';

export default function InstitutionsPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getCurrentUser();
  const canManage = currentUser?.role === 'ADMIN';

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    if (!canManage) return;
    setLoading(true);
    const data = await adminService.getInstitutions();
    setInstitutions(data);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await adminService.deleteInstitution(id);
      loadInstitutions();
    } catch (error) {
      console.error('Error deleting institution:', error);
      alert('Failed to delete institution');
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
            <p className="text-gray-600 mt-1">
              Total: {institutions.length} institution{institutions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => alert('Institution creation modal would open here')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Institution
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No institutions found</p>
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vote Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TIN Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inst.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inst.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inst.phoneNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inst.voteNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inst.tinNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/institutions/${inst.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inst.id, inst.name)}
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
