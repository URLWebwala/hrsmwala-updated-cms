import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const REVENUE_STROKE = '#3d7a2e';
const EXPENSE_STROKE = '#4e5d6c';

interface RevenueVsExpensesChartProps {
  data: Array<{ month: string; revenue: number; expenses: number }>;
  height?: number;
  revenueLabel?: string;
  expensesLabel?: string;
  formatValue?: (value: number) => string;
}

export const RevenueVsExpensesChart: React.FC<RevenueVsExpensesChartProps> = ({
  data,
  height = 360,
  revenueLabel = 'Revenue',
  expensesLabel = 'Expenses',
  formatValue,
}) => {
  const fmt = (v: number) => (formatValue ? formatValue(v) : Number(v).toFixed(2));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="revenuePlAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={REVENUE_STROKE} stopOpacity={0.4} />
            <stop offset="95%" stopColor={REVENUE_STROKE} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={56} />
        <Tooltip
          formatter={(value: number, name: string) => [fmt(value), name]}
        />
        <Legend verticalAlign="top" height={36} />
        <Area
          type="monotone"
          dataKey="revenue"
          name={revenueLabel}
          stroke={REVENUE_STROKE}
          strokeWidth={2}
          fill="url(#revenuePlAreaFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name={expensesLabel}
          stroke={EXPENSE_STROKE}
          strokeWidth={2}
          strokeDasharray="6 5"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
