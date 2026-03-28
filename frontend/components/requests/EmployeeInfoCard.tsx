'use client';

import type { Employee } from '../../types/employee';

interface EmployeeInfoCardProps {
  employee: Employee;
}

const STATUS_COLORS: Record<string, string> = {
  'On Probation': 'bg-yellow-100 text-yellow-800',
  'Confirmed': 'bg-green-100 text-green-800',
  'On LWOP': 'bg-blue-100 text-blue-800',
  'Retired': 'bg-gray-100 text-gray-800',
  'Resigned': 'bg-gray-100 text-gray-800',
  'Terminated': 'bg-red-100 text-red-800',
  'Dismissed': 'bg-red-100 text-red-800',
};

export function EmployeeInfoCard({ employee }: EmployeeInfoCardProps) {
  const statusColor = STATUS_COLORS[employee.status || ''] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-6">
        {/* Photo placeholder */}
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-3xl text-gray-400">👤</span>
          )}
        </div>

        {/* Employee details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.cadre}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
              {employee.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoField label="ZanID" value={employee.zanId} />
            <InfoField label="Payroll Number" value={employee.payrollNumber} />
            <InfoField label="ZSSF Number" value={employee.zssfNumber} />
            <InfoField label="Institution" value={employee.institution?.name} />
            <InfoField label="Ministry" value={employee.ministry} />
            <InfoField label="Department" value={employee.department} />
            <InfoField label="Cadre" value={employee.cadre} />
            <InfoField
              label="Employment Date"
              value={employee.employmentDate ? new Date(employee.employmentDate).toLocaleDateString() : 'N/A'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate" title={value || ''}>
        {value || '-'}
      </p>
    </div>
  );
}
