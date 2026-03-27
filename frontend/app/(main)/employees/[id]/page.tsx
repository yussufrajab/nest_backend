'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeService } from '../../../../services/employeeService';
import type { Employee, EmployeeCertificate } from '../../../../types/employee';
import { useAuth } from '../../../../hooks/use-auth';

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'HRO';

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    const [empData, docsData] = await Promise.all([
      employeeService.getEmployee(id),
      employeeService.getEmployeeDocuments(id),
    ]);
    setEmployee(empData);
    setDocuments(docsData);
    setLoading(false);
  };

  const handleDownloadDocument = (url?: string, name?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Employee not found</h2>
          <Link
            href="/employees"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/employees"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Employees
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                {employee.profileImageUrl ? (
                  <img
                    src={employee.profileImageUrl}
                    alt={employee.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-gray-600 mt-1">{employee.zanId}</p>
                <span className="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  {employee.status || 'Active'}
                </span>
              </div>

              {canEdit && (
                <div className="mt-6 space-y-3">
                  <Link
                    href={`/employees/${employee.id}/edit`}
                    className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Full Name" value={employee.name} />
                <InfoRow label="Gender" value={employee.gender} />
                <InfoRow label="Date of Birth" value={employee.dateOfBirth} />
                <InfoRow label="Place of Birth" value={employee.placeOfBirth} />
                <InfoRow label="Country of Birth" value={employee.countryOfBirth} />
                <InfoRow label="Region" value={employee.region} />
                <InfoRow label="Phone Number" value={employee.phoneNumber} />
                <InfoRow label="Contact Address" value={employee.contactAddress} />
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="ZSSF Number" value={employee.zssfNumber} />
                <InfoRow label="Payroll Number" value={employee.payrollNumber} />
                <InfoRow label="Cadre" value={employee.cadre} />
                <InfoRow label="Salary Scale" value={employee.salaryScale} />
                <InfoRow label="Ministry" value={employee.ministry} />
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Appointment Type" value={employee.appointmentType} />
                <InfoRow label="Contract Type" value={employee.contractType} />
                <InfoRow label="Current Workplace" value={employee.currentWorkplace} />
                <InfoRow
                  label="Reporting Office"
                  value={employee.currentReportingOffice}
                />
                <InfoRow
                  label="Employment Date"
                  value={employee.employmentDate}
                />
                <InfoRow
                  label="Confirmation Date"
                  value={employee.confirmationDate}
                />
                <InfoRow
                  label="Retirement Date"
                  value={employee.retirementDate}
                />
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Documents
              </h3>
              {documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                      {doc.url && (
                        <button
                          onClick={() => handleDownloadDocument(doc.url, doc.name)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
    </div>
  );
}
