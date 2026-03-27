'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, type CreateUserDto } from '../../../../../services/adminService';
import { authService } from '../../../../../services/auth.service';

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);

  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    username: '',
    password: '',
    role: '',
    institutionId: '',
    phoneNumber: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    const data = await adminService.getInstitutions();
    setInstitutions(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.institutionId) newErrors.institutionId = 'Institution is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await adminService.createUser(formData);
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      const apiErrors = error.response?.data?.message || 'Failed to create user';
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
            Add New User
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
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <InputField
              label="Username *"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />
            <InputField
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            <SelectField
              label="Role *"
              name="role"
              value={formData.role}
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
            <SelectField
              label="Institution *"
              name="institutionId"
              value={formData.institutionId}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select institution' },
                ...institutions.map((i) => ({ value: i.id, label: i.name })),
              ]}
              error={errors.institutionId}
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
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
