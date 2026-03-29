'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { RequestStatsByType } from '../../services/dashboardService';

interface RequestStatsChartProps {
  data: RequestStatsByType[];
  chartType?: 'bar' | 'pie';
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#f43f5e',
};

export function RequestStatsChart({ data, chartType = 'bar' }: RequestStatsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p>No data available</p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.type,
    Total: item.count,
    Pending: item.pending,
    Approved: item.approved,
    Rejected: item.rejected,
  }));

  // For pie chart, show total by type
  const pieData = data.map(item => ({
    name: item.type,
    value: item.count,
  }));

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Bar dataKey="Pending" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Approved" fill={STATUS_COLORS.approved} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Rejected" fill={STATUS_COLORS.rejected} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
