'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeSearch } from '../../../../../components/requests/EmployeeSearch';
import { EmployeeInfoCard } from '../../../../../components/requests/EmployeeInfoCard';
import { DocumentUploader } from '../../../../../components/requests/DocumentUploader';
import { requestService } from '../../../../../services/requestService';
import type { Employee } from '../../../../../types/employee';

const REQUIRED_DOCUMENTS = [
  'Academic Certificates',
  'Appointment Letter to Current Position',
  'Performance Appraisal Reports (last 2 years)',
];

export default function NewPromotionRequestPage() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    proposedCadre: '',
    promotionType: '',
    studiedOutsideCountry: false,
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedEmployee) {
      newErrors.employee = 'Please select an employee';
    }

    if (!formData.proposedCadre) {
      newErrors.proposedCadre = 'Proposed cadre is required';
    }

    if (!formData.promotionType) {
      newErrors.promotionType = 'Promotion type is required';
    }

    if (formData.studiedOutsideCountry) {
      // TCU Verification Letter will be required
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
        proposedCadre: formData.proposedCadre,
        promotionType: formData.promotionType,
        studiedOutsideCountry: formData.studiedOutsideCountry,
      };

      const result = await requestService.createPromotionRequest(requestData);
      router.push(`/requests/${result.id}`);
    } catch (error: any) {
      console.error('Error creating request:', error);
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
          <Link href="/requests/promotion" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Promotion Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Promotion Request</h1>

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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Cadre *</label>
                      <select
                        name="proposedCadre"
                        value={formData.proposedCadre}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.proposedCadre ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select</option>
                        <option value="Senior">Senior</option>
                        <option value="Middle">Middle</option>
                        <option value="Junior">Junior</option>
                      </select>
                      {errors.proposedCadre && <p className="mt-1 text-sm text-red-600">{errors.proposedCadre}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Type *</label>
                      <select
                        name="promotionType"
                        value={formData.promotionType}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.promotionType ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select</option>
                        <option value="Education-Based">Education-Based</option>
                        <option value="Performance-Based">Performance-Based</option>
                      </select>
                      {errors.promotionType && <p className="mt-1 text-sm text-red-600">{errors.promotionType}</p>}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="studiedOutsideCountry"
                        checked={formData.studiedOutsideCountry}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Studied Outside Country (TCU verification required)
                      </label>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Upload Documents</h2>
                  <DocumentUploader
                    requiredDocuments={[
                      ...REQUIRED_DOCUMENTS,
                      ...(formData.studiedOutsideCountry ? ['TCU Verification Letter'] : []),
                    ]}
                    uploadedDocuments={documents}
                    onDocumentsChange={setDocuments}
                  />
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/requests/promotion" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
