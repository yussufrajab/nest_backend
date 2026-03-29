'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { EmployeeDistribution } from '../../services/dashboardService';

interface EmployeeStatsWidgetProps {
  data: EmployeeDistribution[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#84cc16', // lime
];

// Format status labels for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'SUSPENDED': 'Suspended',
    'ON_LEAVE': 'On Leave',
    'RETIRED': 'Retired',
    'TERMINATED': 'Terminated',
    'PROBATION': 'Probation',
    'CONFIRMED': 'Confirmed',
    'Unknown': 'Unknown',
  };
  return statusMap[status] || status;
};

export function EmployeeStatsWidget({ data }: EmployeeStatsWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <p>No employee data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: formatStatus(item.status),
    value: item.count,
  }));

  const totalEmployees = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1">
              <p className="text-sm text-slate-600">{formatStatus(item.status)}</p>
              <p className="text-lg font-semibold text-slate-800">{item.count}</p>
            </div>
            <span className="text-xs text-slate-400">
              {((item.count / totalEmployees) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
