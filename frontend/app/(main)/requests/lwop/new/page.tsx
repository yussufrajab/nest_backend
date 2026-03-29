'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeSearch } from '../../../../../components/requests/EmployeeSearch';
import { EmployeeInfoCard } from '../../../../../components/requests/EmployeeInfoCard';
import { DocumentUploader } from '../../../../../components/requests/DocumentUploader';
import { requestService } from '../../../../../services/requestService';
import type { Employee } from '../../../../../types/employee';

const REASON_OPTIONS = ['Medical', 'Family Emergency', 'Education', 'Personal'];

export default function NewLwopRequestPage() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    duration: '',
    reason: '',
    reasonOther: '',
    startDate: '',
    endDate: '',
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedEmployee) newErrors.employee = 'Please select an employee';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const requestData = {
        employeeId: selectedEmployee.id,
        duration: formData.duration,
        reason: formData.reason,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      const result = await requestService.createLwopRequest(requestData);
      router.push(`/requests/${result.id}`);
    } catch (error: any) {
      const apiErrors = error.response?.data?.message || 'Failed to create request';
      setErrors({ form: typeof apiErrors === 'string' ? apiErrors : 'Failed to create request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/requests/lwop" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to LWOP Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Leave Without Pay (LWOP) Request</h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Employee</h2>
              <EmployeeSearch
                onEmployeeFound={setSelectedEmployee}
                onEmployeeClear={() => setSelectedEmployee(null)}
                selectedEmployee={selectedEmployee}
              />
              {errors.employee && <p className="mt-2 text-sm text-red-600">{errors.employee}</p>}
            </section>

            {selectedEmployee && (
              <>
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Employee Information</h2>
                  <EmployeeInfoCard employee={selectedEmployee} />
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Request Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 6 months"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.duration ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.reason ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select</option>
                        {REASON_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.startDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.endDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Upload Documents</h2>
                  <DocumentUploader
                    requiredDocuments={['LWOP Application Letter', 'Supporting Documents']}
                    uploadedDocuments={documents}
                    onDocumentsChange={setDocuments}
                  />
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/requests/lwop" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
                  >
                    {loading ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
