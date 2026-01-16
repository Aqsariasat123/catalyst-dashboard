import { Link } from 'react-router-dom';
import {
  DocumentChartBarIcon,
  BugAntIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/Card';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function ReportCard({ title, description, icon, href, color }: ReportCardProps) {
  return (
    <Link to={href}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-redstone-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-redstone-500 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ReportsPage() {
  const reports = [
    {
      title: 'Test Execution Report',
      description:
        'View test execution results with pass/fail breakdown, filter by date range, project, or milestone. Export to PDF or Excel.',
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6 text-green-600" />,
      href: '/qa/reports/executions',
      color: 'bg-green-100 dark:bg-green-500/10',
    },
    {
      title: 'Bug Summary Report',
      description:
        'Analyze bugs by severity, status, and assignee. View aging metrics, resolution times, and workload distribution. Export to PDF or Excel.',
      icon: <BugAntIcon className="w-6 h-6 text-red-600" />,
      href: '/qa/reports/bugs',
      color: 'bg-red-100 dark:bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <DocumentChartBarIcon className="w-7 h-7 text-redstone-500" />
          QA Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Generate and export detailed QA reports
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <ReportCard key={report.title} {...report} />
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Export Tips
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-redstone-500 font-bold">PDF</span>
              <span>
                Best for sharing with stakeholders and printing. Includes charts
                and formatted tables.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">Excel</span>
              <span>
                Best for further analysis. Contains raw data that can be filtered
                and pivoted.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
