'use client';

import { useState } from 'react';
import { reportService } from '../../../services/reportService';
import type { ReportType, ReportConfig } from '../../../types/report';

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'employees',
    label: 'Employees Report',
    description: 'Generate a report of all employees with their details',
  },
  {
    value: 'requests',
    label: 'Requests Report',
    description: 'Generate a report of all requests and their status',
  },
  {
    value: 'complaints',
    label: 'Complaints Report',
    description: 'Generate a report of all complaints and their status',
  },
  {
    value: 'institution-summary',
    label: 'Institution Summary',
    description: 'Generate a summary report per institution',
  },
  {
    value: 'activity-log',
    label: 'Activity Log',
    description: 'Generate a report of system activities',
  },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerate = async () => {
    if (!selectedType) {
      alert('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const config: ReportConfig = {
        type: selectedType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const result = await reportService.generateReport(config);
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600 mb-8">Generate and download system reports</p>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generate New Report
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ReportType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select report type</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {selectedType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{REPORT_TYPES.find(t => t.value === selectedType)?.label}</strong>
                  <br />
                  {REPORT_TYPES.find(t => t.value === selectedType)?.description}
                </p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedType}
              className="w-full px-6 py-3 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 font-medium shadow-md shadow-primary-500/20"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`text-left p-6 rounded-lg border-2 transition ${
                selectedType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {type.label}
              </h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
