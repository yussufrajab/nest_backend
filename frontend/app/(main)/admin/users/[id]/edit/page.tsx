'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { adminService, type User, type UpdateUserDto } from '../../../../../../services/adminService';
import { authService } from '../../../../../../services/auth.service';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [userData, setUserData] = useState<User | null>(null);

  const [formData, setFormData] = useState<UpdateUserDto>({
    name: '',
    role: '',
    active: true,
    phoneNumber: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadUserData();
    loadInstitutions();
  }, [userId]);

  const loadUserData = async () => {
    setFetchingUser(true);
    try {
      const user = await adminService.getUser(userId);
      if (user) {
        setUserData(user);
        setFormData({
          name: user.name || '',
          role: user.role || '',
          active: user.active ?? true,
          phoneNumber: user.phoneNumber || '',
          email: user.email || '',
        });
      } else {
        alert('User not found');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Failed to load user data');
      router.push('/admin/users');
    } finally {
      setFetchingUser(false);
    }
  };

  const loadInstitutions = async () => {
    const result = await adminService.getInstitutions();
    setInstitutions(result.institutions || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await adminService.updateUser(userId, formData);
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error updating user:', error);
      const apiErrors = error.response?.data?.message || 'Failed to update user';
      setErrors({ form: apiErrors });
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        </div>
      </div>
    );
  }

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Users
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit User: {userData.username}
          </h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Full Name *"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              error={errors.name}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={userData.username}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <SelectField
              label="Role *"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select role' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'HHRMD', label: 'HHRMD' },
                { value: 'HRO', label: 'HRO' },
                { value: 'HRMO', label: 'HRMO' },
                { value: 'DO', label: 'DO' },
                { value: 'EMP', label: 'Employee' },
                { value: 'PO', label: 'PO' },
                { value: 'CSCS', label: 'CSCS' },
                { value: 'HRRP', label: 'HRRP' },
              ]}
              error={errors.role}
            />

            <InputField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution
              </label>
              <input
                type="text"
                value={userData.institution?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Institution cannot be changed</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active ?? true}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Account Active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/admin/users"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
