'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { InstitutionStats } from '../../services/dashboardService';

interface InstitutionStatsWidgetProps {
  data: InstitutionStats[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899'];

export function InstitutionStatsWidget({ data }: InstitutionStatsWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <p>No institution data available</p>
      </div>
    );
  }

  // Sort by request count and take top 8
  const chartData = [...data]
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      shortName: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
    }));

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis
              dataKey="shortName"
              type="category"
              tick={{ fill: '#64748b', fontSize: 11 }}
              width={90}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="requestCount" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Institution</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Requests</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Employees</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 text-slate-700 truncate max-w-[150px]">{item.name}</td>
                <td className="py-2 text-right text-slate-800 font-medium">{item.requestCount}</td>
                <td className="py-2 text-right text-slate-600">{item.employeeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
