'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeSearch } from '../../../../../components/requests/EmployeeSearch';
import { EmployeeInfoCard } from '../../../../../components/requests/EmployeeInfoCard';
import { DocumentUploader } from '../../../../../components/requests/DocumentUploader';
import { requestService } from '../../../../../services/requestService';
import type { Employee } from '../../../../../types/employee';

export default function NewCadreChangeRequestPage() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    newCadre: '',
    reason: '',
    studiedOutsideCountry: false,
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedEmployee) newErrors.employee = 'Please select an employee';
    if (!formData.newCadre) newErrors.newCadre = 'New cadre is required';
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
        newCadre: formData.newCadre,
        reason: formData.reason,
        studiedOutsideCountry: formData.studiedOutsideCountry,
      };
      const result = await requestService.createCadreChangeRequest(requestData);
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
          <Link href="/requests/cadre-change" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Cadre Change Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Cadre Change Request</h1>

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
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Cadre *</label>
                      <select
                        name="newCadre"
                        value={formData.newCadre}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.newCadre ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select</option>
                        <option value="Senior">Senior</option>
                        <option value="Middle">Middle</option>
                        <option value="Junior">Junior</option>
                      </select>
                      {errors.newCadre && <p className="mt-1 text-sm text-red-600">{errors.newCadre}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Justification for cadre change..."
                      />
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
                      'Academic Qualifications',
                      'Current Appointment Letter',
                      ...(formData.studiedOutsideCountry ? ['TCU Verification Letter'] : []),
                      'Job Description for New Cadre',
                    ]}
                    uploadedDocuments={documents}
                    onDocumentsChange={setDocuments}
                  />
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/requests/cadre-change" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
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
