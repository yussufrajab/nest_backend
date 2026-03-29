'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, type CreateInstitutionDto } from '../../../../../services/adminService';
import { authService } from '../../../../../services/auth.service';

export default function NewInstitutionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInstitutionDto>({
    name: '',
    email: '',
    phoneNumber: '',
    voteNumber: '',
    tinNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentUser = authService.getCurrentUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Institution name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await adminService.createInstitution(formData);
      router.push('/admin/institutions');
    } catch (error: any) {
      console.error('Error creating institution:', error);
      const apiErrors = error.response?.data?.message || 'Failed to create institution';
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
            href="/admin/institutions"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Institutions
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New Institution
          </h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Institution Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g., Ministry of Education"
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              error={errors.email}
              placeholder="institution@example.com"
            />
            <InputField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              placeholder="07XXXXXXXX"
            />
            <InputField
              label="Vote Number"
              name="voteNumber"
              value={formData.voteNumber || ''}
              onChange={handleChange}
              placeholder="Vote number identifier"
            />
            <InputField
              label="TIN Number"
              name="tinNumber"
              value={formData.tinNumber || ''}
              onChange={handleChange}
              placeholder="Tax Identification Number"
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/admin/institutions"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
              >
                {loading ? 'Creating...' : 'Create Institution'}
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
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
