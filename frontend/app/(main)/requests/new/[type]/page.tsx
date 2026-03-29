'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeService } from '../../../../../services/employeeService';
import { requestService } from '../../../../../services/requestService';
import type { Employee } from '../../../../../types/employee';
import type {
  RequestType,
  CreatePromotionRequestDto,
  CreateLwopRequestDto,
  CreateCadreChangeRequestDto,
  CreateRetirementRequestDto,
  CreateResignationRequestDto,
  CreateServiceExtensionRequestDto,
  CreateSeparationRequestDto,
} from '../../../../../types/request';

const REQUEST_LABELS: Record<string, string> = {
  confirmation: 'Confirmation Request',
  promotion: 'Promotion Request',
  lwop: 'Leave Without Pay Request',
  'cadre-change': 'Cadre Change Request',
  retirement: 'Retirement Request',
  resignation: 'Resignation Request',
  'service-extension': 'Service Extension Request',
  separation: 'Separation Request',
};

export default function NewRequestPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as RequestType;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const result = await employeeService.getEmployees({ limit: 100 });
    setEmployees(result.employees);
    setFetching(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedEmployeeId) newErrors.employeeId = 'Employee is required';

    // Type-specific validations
    if (type === 'confirmation') {
      if (!formData.proposedConfirmationDate) newErrors.proposedConfirmationDate = 'Proposed confirmation date is required';
    }
    if (type === 'promotion') {
      if (!formData.proposedCadre) newErrors.proposedCadre = 'Proposed cadre is required';
      if (!formData.promotionType) newErrors.promotionType = 'Promotion type is required';
    }
    if (type === 'lwop') {
      if (!formData.duration) newErrors.duration = 'Duration is required';
      if (!formData.reason) newErrors.reason = 'Reason is required';
    }
    if (type === 'cadre-change') {
      if (!formData.newCadre) newErrors.newCadre = 'New cadre is required';
    }
    if (type === 'retirement') {
      if (!formData.retirementType) newErrors.retirementType = 'Retirement type is required';
      if (!formData.proposedDate) newErrors.proposedDate = 'Proposed date is required';
    }
    if (type === 'resignation') {
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    }
    if (type === 'service-extension') {
      if (!formData.currentRetirementDate) newErrors.currentRetirementDate = 'Current retirement date is required';
      if (!formData.requestedExtensionPeriod) newErrors.requestedExtensionPeriod = 'Requested extension period is required';
      if (!formData.justification) newErrors.justification = 'Justification is required';
    }
    if (type === 'separation') {
      if (!formData.type) newErrors.type = 'Type is required';
      if (!formData.reason) newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = { ...formData, employeeId: selectedEmployeeId };

      let result;
      switch (type) {
        case 'confirmation':
          result = await requestService.createConfirmationRequest(requestData);
          break;
        case 'promotion':
          result = await requestService.createPromotionRequest(requestData);
          break;
        case 'lwop':
          result = await requestService.createLwopRequest(requestData);
          break;
        case 'cadre-change':
          result = await requestService.createCadreChangeRequest(requestData);
          break;
        case 'retirement':
          result = await requestService.createRetirementRequest(requestData);
          break;
        case 'resignation':
          result = await requestService.createResignationRequest(requestData);
          break;
        case 'service-extension':
          result = await requestService.createServiceExtensionRequest(requestData);
          break;
        case 'separation':
          result = await requestService.createSeparationRequest(requestData);
          break;
      }

      router.push(`/requests/${result.id}`);
    } catch (error: any) {
      console.error('Error creating request:', error);
      const apiErrors = error.response?.data?.message || 'Failed to create request';
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

  const requestLabel = REQUEST_LABELS[type] || 'Request';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/requests"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            New {requestLabel}
          </h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <section>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Employee *
              </label>
              <select
                name="employeeId"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.zanId})
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="text-sm text-red-600 mt-1">{errors.employeeId}</p>}
            </section>

            {/* Type-specific fields */}
            {type === 'confirmation' && (
              <>
                <InputField
                  label="Proposed Confirmation Date"
                  name="proposedConfirmationDate"
                  type="date"
                  value={formData.proposedConfirmationDate || ''}
                  onChange={handleChange}
                />
                <TextareaField
                  label="Notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                />
              </>
            )}

            {type === 'promotion' && (
              <>
                <SelectField
                  label="Proposed Cadre *"
                  name="proposedCadre"
                  value={formData.proposedCadre || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Senior', label: 'Senior' },
                    { value: 'Middle', label: 'Middle' },
                    { value: 'Junior', label: 'Junior' },
                  ]}
                  error={errors.proposedCadre}
                />
                <SelectField
                  label="Promotion Type *"
                  name="promotionType"
                  value={formData.promotionType || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Meritorious', label: 'Meritorious' },
                    { value: 'Normal', label: 'Normal' },
                  ]}
                  error={errors.promotionType}
                />
                <CheckboxField
                  label="Studied Outside Country"
                  name="studiedOutsideCountry"
                  checked={formData.studiedOutsideCountry || false}
                  onChange={handleChange}
                />
              </>
            )}

            {type === 'lwop' && (
              <>
                <InputField
                  label="Duration *"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleChange}
                  error={errors.duration}
                  placeholder="e.g., 3 months"
                />
                <TextareaField
                  label="Reason *"
                  name="reason"
                  value={formData.reason || ''}
                  onChange={handleChange}
                  error={errors.reason}
                />
                <InputField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={handleChange}
                />
                <InputField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={handleChange}
                />
              </>
            )}

            {type === 'cadre-change' && (
              <>
                <InputField
                  label="New Cadre *"
                  name="newCadre"
                  value={formData.newCadre || ''}
                  onChange={handleChange}
                  error={errors.newCadre}
                />
                <TextareaField
                  label="Reason"
                  name="reason"
                  value={formData.reason || ''}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="Studied Outside Country"
                  name="studiedOutsideCountry"
                  checked={formData.studiedOutsideCountry || false}
                  onChange={handleChange}
                />
              </>
            )}

            {type === 'retirement' && (
              <>
                <SelectField
                  label="Retirement Type *"
                  name="retirementType"
                  value={formData.retirementType || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Normal', label: 'Normal Retirement' },
                    { value: 'Medical', label: 'Medical Retirement' },
                  ]}
                  error={errors.retirementType}
                />
                <InputField
                  label="Proposed Date *"
                  name="proposedDate"
                  type="date"
                  value={formData.proposedDate || ''}
                  onChange={handleChange}
                  error={errors.proposedDate}
                />
                <TextareaField
                  label="Illness Description"
                  name="illnessDescription"
                  value={formData.illnessDescription || ''}
                  onChange={handleChange}
                />
                <TextareaField
                  label="Delay Reason"
                  name="delayReason"
                  value={formData.delayReason || ''}
                  onChange={handleChange}
                />
              </>
            )}

            {type === 'resignation' && (
              <>
                <InputField
                  label="Effective Date *"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate || ''}
                  onChange={handleChange}
                  error={errors.effectiveDate}
                />
                <TextareaField
                  label="Reason"
                  name="reason"
                  value={formData.reason || ''}
                  onChange={handleChange}
                />
              </>
            )}

            {type === 'service-extension' && (
              <>
                <InputField
                  label="Current Retirement Date *"
                  name="currentRetirementDate"
                  type="date"
                  value={formData.currentRetirementDate || ''}
                  onChange={handleChange}
                  error={errors.currentRetirementDate}
                />
                <SelectField
                  label="Requested Extension Period *"
                  name="requestedExtensionPeriod"
                  value={formData.requestedExtensionPeriod || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: '6 months', label: '6 months' },
                    { value: '1 year', label: '1 year' },
                    { value: '2 years', label: '2 years' },
                  ]}
                  error={errors.requestedExtensionPeriod}
                />
                <TextareaField
                  label="Justification *"
                  name="justification"
                  value={formData.justification || ''}
                  onChange={handleChange}
                  error={errors.justification}
                />
              </>
            )}

            {type === 'separation' && (
              <>
                <SelectField
                  label="Type *"
                  name="type"
                  value={formData.type || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Dismissal', label: 'Dismissal' },
                    { value: 'Termination', label: 'Termination' },
                  ]}
                  error={errors.type}
                />
                <TextareaField
                  label="Reason *"
                  name="reason"
                  value={formData.reason || ''}
                  onChange={handleChange}
                  error={errors.reason}
                />
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/requests"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
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

function TextareaField({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function CheckboxField({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="ml-2 text-sm text-gray-700">{label}</label>
    </div>
  );
}
