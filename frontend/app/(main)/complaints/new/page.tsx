'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { complaintService } from '../../../../services/complaintService';
import type { ComplaintType, CreateComplaintDto } from '../../../../types/complaint';

const COMPLAINT_TYPES: { value: ComplaintType; label: string }[] = [
  { value: 'Misconduct', label: 'Misconduct' },
  { value: 'Harassment', label: 'Harassment' },
  { value: 'Corruption', label: 'Corruption' },
  { value: 'Discrimination', label: 'Discrimination' },
  { value: 'Other', label: 'Other' },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateComplaintDto>({
    complaintType: 'Misconduct',
    subject: '',
    details: '',
    complainantPhoneNumber: '',
    nextOfKinPhoneNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.complaintType) newErrors.complaintType = 'Complaint type is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.details.trim()) newErrors.details = 'Details are required';
    if (!formData.complainantPhoneNumber.trim()) newErrors.complainantPhoneNumber = 'Phone number is required';
    if (!formData.nextOfKinPhoneNumber.trim()) newErrors.nextOfKinPhoneNumber = 'Next of kin phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await complaintService.createComplaint(formData);
      router.push(`/complaints/${result.id}`);
    } catch (error: any) {
      console.error('Error creating complaint:', error);
      const apiErrors = error.response?.data?.message || 'Failed to create complaint';
      setErrors({ form: apiErrors });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/complaints"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Complaints
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            File a Complaint
          </h1>

          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All complaints are handled confidentially.
                Please provide accurate information to help us investigate your complaint effectively.
              </p>
            </div>

            <SelectField
              label="Complaint Type *"
              name="complaintType"
              value={formData.complaintType}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select type' },
                ...COMPLAINT_TYPES,
              ]}
              error={errors.complaintType}
            />

            <InputField
              label="Subject *"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              placeholder="Brief summary of your complaint"
            />

            <TextareaField
              label="Complaint Details *"
              name="details"
              value={formData.details}
              onChange={handleChange}
              error={errors.details}
              rows={6}
              placeholder="Please describe your complaint in detail, including dates, locations, and any relevant information"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Your Phone Number *"
                name="complainantPhoneNumber"
                type="tel"
                value={formData.complainantPhoneNumber}
                onChange={handleChange}
                error={errors.complainantPhoneNumber}
                placeholder="e.g., +255 123 456 789"
              />
              <InputField
                label="Next of Kin Phone Number *"
                name="nextOfKinPhoneNumber"
                type="tel"
                value={formData.nextOfKinPhoneNumber}
                onChange={handleChange}
                error={errors.nextOfKinPhoneNumber}
                placeholder="e.g., +255 123 456 789"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/complaints"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
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
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
