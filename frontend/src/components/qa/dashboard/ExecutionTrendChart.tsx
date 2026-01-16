import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ExecutionTrendData } from '@/types/qa.types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ExecutionTrendChartProps {
  data: ExecutionTrendData[];
  title?: string;
  className?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ExecutionTrendChart({
  data,
  title = 'Execution Trend',
  className,
}: ExecutionTrendChartProps) {
  // Generate sample data if none provided
  const chartData = data.length > 0 ? data : generateSampleData();

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="pass"
                name="Pass"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="fail"
                name="Fail"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="blocked"
                name="Blocked"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate sample data for the last 7 days
function generateSampleData(): ExecutionTrendData[] {
  const data: ExecutionTrendData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pass: Math.floor(Math.random() * 20) + 10,
      fail: Math.floor(Math.random() * 8) + 2,
      blocked: Math.floor(Math.random() * 5),
      skipped: Math.floor(Math.random() * 3),
      total: 0, // Will be calculated
    });
  }

  // Calculate totals
  data.forEach((d) => {
    d.total = d.pass + d.fail + d.blocked + d.skipped;
  });

  return data;
}
