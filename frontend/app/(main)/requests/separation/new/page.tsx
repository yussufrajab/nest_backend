'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployeeSearch } from '../../../../../components/requests/EmployeeSearch';
import { EmployeeInfoCard } from '../../../../../components/requests/EmployeeInfoCard';
import { DocumentUploader } from '../../../../../components/requests/DocumentUploader';
import { requestService } from '../../../../../services/requestService';
import type { Employee } from '../../../../../types/employee';

const DISCIPLINARY_REASONS = [
  'Gross Misconduct',
  'Repeated Violation of Rules',
  'Fraud/Dishonesty',
  'Insubordination',
  'Absent Without Leave',
  'Poor Performance',
  'Other',
];

export default function NewSeparationRequestPage() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    reasonOther: '',
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Automatically set separation type based on employee status
  // BR-TERM-002: Termination for Probation, Dismissal for Confirmed
  useEffect(() => {
    if (selectedEmployee) {
      const separationType = selectedEmployee.status === 'Confirmed' ? 'Dismissal' : 'Termination';
      setFormData((prev) => ({ ...prev, type: separationType }));
    } else {
      setFormData((prev) => ({ ...prev, type: '' }));
    }
  }, [selectedEmployee]);

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
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const reason = formData.reason === 'Other' ? formData.reasonOther : formData.reason;
      const requestData = {
        employeeId: selectedEmployee.id,
        type: formData.type,
        reason,
      };
      const result = await requestService.createSeparationRequest(requestData);
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
          <Link href="/requests/separation" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Separation Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Separation Request</h1>
          <p className="text-sm text-gray-600 mb-4">
            Termination: For probationary employees | Dismissal: For confirmed employees
          </p>

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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-blue-900 mb-1">Separation Type (Auto-Selected)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-800">
                          {formData.type}
                        </span>
                        <span className="text-sm text-blue-600">
                          {formData.type === 'Termination'
                            ? '(Employee is On Probation)'
                            : formData.type === 'Dismissal'
                            ? '(Employee is Confirmed)'
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Type is automatically determined based on employee status per BR-TERM-002
                      </p>
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
                        {DISCIPLINARY_REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                    </div>

                    {formData.reason === 'Other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specify Other Reason *
                        </label>
                        <input
                          type="text"
                          name="reasonOther"
                          value={formData.reasonOther}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Specify the reason..."
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Upload Documents</h2>
                  <DocumentUploader
                    requiredDocuments={[
                      'Disciplinary Committee Report',
                      'Evidence Documents',
                      'Show Cause Letter Response',
                      'Hearing Minutes',
                    ]}
                    uploadedDocuments={documents}
                    onDocumentsChange={setDocuments}
                  />
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/requests/separation" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
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
