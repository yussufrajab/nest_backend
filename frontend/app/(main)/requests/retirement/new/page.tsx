'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeSearch } from '../../../../../components/requests/EmployeeSearch';
import { EmployeeInfoCard } from '../../../../../components/requests/EmployeeInfoCard';
import { DocumentUploader } from '../../../../../components/requests/DocumentUploader';
import { requestService } from '../../../../../services/requestService';
import type { Employee } from '../../../../../types/employee';

const RETIREMENT_TYPES = ['Normal', 'Medical', 'Voluntary'];

export default function NewRetirementRequestPage() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    retirementType: '',
    proposedDate: '',
    illnessDescription: '',
    delayReason: '',
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
    if (!formData.retirementType) newErrors.retirementType = 'Retirement type is required';
    if (!formData.proposedDate) newErrors.proposedDate = 'Proposed date is required';
    if (formData.retirementType === 'Medical' && !formData.illnessDescription) {
      newErrors.illnessDescription = 'Illness description is required for medical retirement';
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
        retirementType: formData.retirementType,
        proposedDate: formData.proposedDate,
        illnessDescription: formData.illnessDescription,
        delayReason: formData.delayReason,
      };
      const result = await requestService.createRetirementRequest(requestData);
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
          <Link href="/requests/retirement" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Retirement Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Retirement Request</h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{errors.form}</div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Retirement Type *</label>
                      <select
                        name="retirementType"
                        value={formData.retirementType}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.retirementType ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select</option>
                        {RETIREMENT_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.retirementType && <p className="mt-1 text-sm text-red-600">{errors.retirementType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Date *</label>
                      <input
                        type="date"
                        name="proposedDate"
                        value={formData.proposedDate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.proposedDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.proposedDate && <p className="mt-1 text-sm text-red-600">{errors.proposedDate}</p>}
                    </div>

                    {formData.retirementType === 'Medical' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Illness Description *
                        </label>
                        <textarea
                          name="illnessDescription"
                          value={formData.illnessDescription}
                          onChange={handleChange}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.illnessDescription ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Describe the medical condition..."
                        />
                        {errors.illnessDescription && (
                          <p className="mt-1 text-sm text-red-600">{errors.illnessDescription}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delay Reason (if retiring after normal age)
                      </label>
                      <textarea
                        name="delayReason"
                        value={formData.delayReason}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Reason for delayed retirement..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Upload Documents</h2>
                  <DocumentUploader
                    requiredDocuments={[
                      'Retirement Application Letter',
                      'Age Verification Documents',
                      ...(formData.retirementType === 'Medical' ? ['Medical Board Report'] : []),
                      'Handover Plan',
                    ]}
                    uploadedDocuments={documents}
                    onDocumentsChange={setDocuments}
                  />
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/requests/retirement" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
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
