'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { employeeService } from '../../../../services/employeeService';
import type { CreateEmployeeDto } from '../../../../types/employee';

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);

  const [formData, setFormData] = useState<CreateEmployeeDto>({
    name: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    region: '',
    countryOfBirth: '',
    zanId: '',
    phoneNumber: '',
    contactAddress: '',
    zssfNumber: '',
    payrollNumber: '',
    cadre: '',
    salaryScale: '',
    ministry: '',
    department: '',
    appointmentType: '',
    contractType: '',
    recentTitleDate: '',
    currentReportingOffice: '',
    currentWorkplace: '',
    employmentDate: '',
    confirmationDate: '',
    retirementDate: '',
    status: 'Active',
    institutionId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    // TODO: Load from institutions service
    setInstitutions([
      { id: '1', name: 'Ministry of Public Service' },
      { id: '2', name: 'Ministry of Health' },
      { id: '3', name: 'Ministry of Education' },
    ]);
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
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.zanId.trim()) newErrors.zanId = 'ZAN ID is required';
    if (!formData.institutionId) newErrors.institutionId = 'Institution is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await employeeService.createEmployee(formData);
      router.push('/employees');
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const apiErrors = error.response?.data?.message || 'Failed to create employee';
      setErrors({ form: apiErrors });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/employees"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Employees
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New Employee
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
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <SelectField
                  label="Gender *"
                  name="gender"
                  value={formData.gender}
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
                  value={formData.placeOfBirth || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Country of Birth"
                  name="countryOfBirth"
                  value={formData.countryOfBirth || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Region"
                  name="region"
                  value={formData.region || ""}
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
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Contact Address"
                  name="contactAddress"
                  value={formData.contactAddress || ""}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Identification */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Identification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="ZAN ID *"
                  name="zanId"
                  value={formData.zanId}
                  onChange={handleChange}
                  error={errors.zanId}
                  required
                />
                <InputField
                  label="ZSSF Number"
                  name="zssfNumber"
                  value={formData.zssfNumber || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Payroll Number"
                  name="payrollNumber"
                  value={formData.payrollNumber || ""}
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
                  value={formData.ministry || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Department"
                  name="department"
                  value={formData.department || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Cadre"
                  name="cadre"
                  value={formData.cadre || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Salary Scale"
                  name="salaryScale"
                  value={formData.salaryScale || ""}
                  onChange={handleChange}
                />
                <SelectField
                  label="Appointment Type"
                  name="appointmentType"
                  value={formData.appointmentType || ""}
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
                  value={formData.contractType || ""}
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
                  value={formData.currentWorkplace || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Reporting Office"
                  name="currentReportingOffice"
                  value={formData.currentReportingOffice || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Employment Date"
                  name="employmentDate"
                  type="date"
                  value={formData.employmentDate || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Confirmation Date"
                  name="confirmationDate"
                  type="date"
                  value={formData.confirmationDate || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Retirement Date"
                  name="retirementDate"
                  type="date"
                  value={formData.retirementDate || ""}
                  onChange={handleChange}
                />
                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
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

            {/* Institution */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Institution
              </h2>
              <SelectField
                label="Institution *"
                name="institutionId"
                value={formData.institutionId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select Institution' },
                  ...institutions.map((i) => ({ value: i.id, label: i.name })),
                ]}
                error={errors.institutionId}
                required
              />
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/employees"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Employee'}
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
  value?: string;
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
        value={value || ''}
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
