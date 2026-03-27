'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeService } from '../../../../../services/employeeService';
import type { Employee, UpdateEmployeeDto } from '../../../../../types/employee';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState<UpdateEmployeeDto>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    const data = await employeeService.getEmployee(id);
    if (data) {
      setEmployee(data);
      setFormData({
        name: data.name,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth?.split('T')[0] || '',
        placeOfBirth: data.placeOfBirth || '',
        region: data.region || '',
        countryOfBirth: data.countryOfBirth || '',
        zanId: data.zanId,
        phoneNumber: data.phoneNumber || '',
        contactAddress: data.contactAddress || '',
        zssfNumber: data.zssfNumber || '',
        payrollNumber: data.payrollNumber || '',
        cadre: data.cadre || '',
        salaryScale: data.salaryScale || '',
        ministry: data.ministry || '',
        department: data.department || '',
        appointmentType: data.appointmentType || '',
        contractType: data.contractType || '',
        recentTitleDate: data.recentTitleDate?.split('T')[0] || '',
        currentReportingOffice: data.currentReportingOffice || '',
        currentWorkplace: data.currentWorkplace || '',
        employmentDate: data.employmentDate?.split('T')[0] || '',
        confirmationDate: data.confirmationDate?.split('T')[0] || '',
        retirementDate: data.retirementDate?.split('T')[0] || '',
        status: data.status || 'Active',
        institutionId: data.institutionId,
      });
    }
    setFetching(false);
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

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.zanId?.trim()) newErrors.zanId = 'ZAN ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await employeeService.updateEmployee(id, formData);
      router.push(`/employees/${id}`);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const apiErrors = error.response?.data?.message || 'Failed to update employee';
      setErrors({ form: apiErrors });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/employees/${id}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Employee
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Employee: {employee?.name}
          </h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name *"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <SelectField
                  label="Gender *"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                  error={errors.gender}
                  required
                />
                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Place of Birth"
                  name="placeOfBirth"
                  value={formData.placeOfBirth || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Country of Birth"
                  name="countryOfBirth"
                  value={formData.countryOfBirth || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Region"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Contact Address"
                  name="contactAddress"
                  value={formData.contactAddress || ''}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Employment Details */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Employment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Ministry"
                  name="ministry"
                  value={formData.ministry || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Department"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Cadre"
                  name="cadre"
                  value={formData.cadre || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Salary Scale"
                  name="salaryScale"
                  value={formData.salaryScale || ''}
                  onChange={handleChange}
                />
                <SelectField
                  label="Appointment Type"
                  name="appointmentType"
                  value={formData.appointmentType || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Permanent', label: 'Permanent' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Temporary', label: 'Temporary' },
                  ]}
                />
                <SelectField
                  label="Contract Type"
                  name="contractType"
                  value={formData.contractType || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Fixed Term', label: 'Fixed Term' },
                    { value: 'Open Ended', label: 'Open Ended' },
                  ]}
                />
                <InputField
                  label="Current Workplace"
                  name="currentWorkplace"
                  value={formData.currentWorkplace || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Reporting Office"
                  name="currentReportingOffice"
                  value={formData.currentReportingOffice || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Employment Date"
                  name="employmentDate"
                  type="date"
                  value={formData.employmentDate || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Confirmation Date"
                  name="confirmationDate"
                  type="date"
                  value={formData.confirmationDate || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="Retirement Date"
                  name="retirementDate"
                  type="date"
                  value={formData.retirementDate || ''}
                  onChange={handleChange}
                />
                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Retired', label: 'Retired' },
                    { value: 'Resigned', label: 'Resigned' },
                  ]}
                />
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href={`/employees/${id}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
