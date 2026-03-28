'use client';

import { useState } from 'react';
import { employeeService } from '../../services/employeeService';
import type { Employee } from '../../types/employee';

interface EmployeeSearchProps {
  onEmployeeFound: (employee: Employee) => void;
  onEmployeeClear: () => void;
  selectedEmployee?: Employee | null;
}

export function EmployeeSearch({ onEmployeeFound, onEmployeeClear, selectedEmployee }: EmployeeSearchProps) {
  const [searchType, setSearchType] = useState<'zanId' | 'payrollNumber'>('zanId');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = searchType === 'zanId'
        ? { zanId: searchValue }
        : { payrollNumber: searchValue };

      const result = await employeeService.searchEmployeeByZanIdOrPayroll(params);

      if (result.employee) {
        onEmployeeFound(result.employee);
      } else {
        setError('No employee found with the provided ' + (searchType === 'zanId' ? 'ZanID' : 'Payroll Number'));
        onEmployeeClear();
      }
    } catch (err) {
      setError('Failed to search for employee. Please try again.');
      onEmployeeClear();
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setError('');
    onEmployeeClear();
  };

  if (selectedEmployee) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-green-800">Employee Selected</h3>
          <button
            onClick={handleClear}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            Change
          </button>
        </div>
        <p className="text-green-700 text-sm">
          {selectedEmployee.name} ({selectedEmployee.zanId})
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Employee</h3>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            setSearchType('zanId');
            setSearchValue('');
            setError('');
          }}
          className={`px-3 py-1 text-sm rounded-lg transition ${
            searchType === 'zanId'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          By ZanID
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('payrollNumber');
            setSearchValue('');
            setError('');
          }}
          className={`px-3 py-1 text-sm rounded-lg transition ${
            searchType === 'payrollNumber'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          By Payroll Number
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && searchValue.trim()) {
              e.preventDefault();
              handleSearch(e);
            }
          }}
          placeholder={searchType === 'zanId' ? 'Enter ZanID (e.g., 123456789)' : 'Enter Payroll Number'}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !searchValue.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
