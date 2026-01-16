import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Types for report data
export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  filters?: Record<string, string>;
  columns: ReportColumn[];
  rows: Record<string, any>[];
  summary?: Record<string, string | number>;
}

// PDF Export
export const exportToPDF = async (reportData: ReportData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportData.title, pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  if (reportData.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.subtitle, pageWidth / 2, 28, { align: 'center' });
  }

  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated: ${reportData.generatedAt.toLocaleString()}`,
    pageWidth / 2,
    reportData.subtitle ? 36 : 28,
    { align: 'center' }
  );

  // Filters applied
  let startY = reportData.subtitle ? 45 : 38;
  if (reportData.filters && Object.keys(reportData.filters).length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('Filters Applied:', 14, startY);
    startY += 6;
    Object.entries(reportData.filters).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, startY);
      startY += 5;
    });
    startY += 5;
  }

  // Summary section
  if (reportData.summary && Object.keys(reportData.summary).length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Summary', 14, startY);
    startY += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(reportData.summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, startY);
      startY += 5;
    });
    startY += 5;
  }

  // Table
  const tableHeaders = reportData.columns.map((col) => col.header);
  const tableData = reportData.rows.map((row) =>
    reportData.columns.map((col) => {
      const value = row[col.key];
      if (value === null || value === undefined) return '-';
      if (value instanceof Date) return value.toLocaleDateString();
      return String(value);
    })
  );

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: startY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [220, 53, 69], // Redstone color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: reportData.columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Task Dashboard - QA Reports',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Download
  const fileName = `${reportData.title.replace(/\s+/g, '_')}_${formatDateForFileName(reportData.generatedAt)}.pdf`;
  doc.save(fileName);
};

// Excel Export
export const exportToExcel = async (reportData: ReportData): Promise<void> => {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Prepare header row with metadata
  const metadataRows: string[][] = [
    [reportData.title],
    reportData.subtitle ? [reportData.subtitle] : [],
    [`Generated: ${reportData.generatedAt.toLocaleString()}`],
    [],
  ].filter((row) => row.length > 0);

  // Add filters if any
  if (reportData.filters && Object.keys(reportData.filters).length > 0) {
    metadataRows.push(['Filters Applied:']);
    Object.entries(reportData.filters).forEach(([key, value]) => {
      metadataRows.push([`  ${key}: ${value}`]);
    });
    metadataRows.push([]);
  }

  // Add summary if any
  if (reportData.summary && Object.keys(reportData.summary).length > 0) {
    metadataRows.push(['Summary:']);
    Object.entries(reportData.summary).forEach(([key, value]) => {
      metadataRows.push([`  ${key}: ${value}`]);
    });
    metadataRows.push([]);
  }

  // Create data for Excel
  const headers = reportData.columns.map((col) => col.header);
  const dataRows = reportData.rows.map((row) =>
    reportData.columns.map((col) => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toLocaleDateString();
      return value;
    })
  );

  // Combine all rows
  const allRows = [...metadataRows, headers, ...dataRows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths
  const colWidths = reportData.columns.map((col) => ({
    wch: col.width || Math.max(col.header.length, 15),
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Download
  const fileName = `${reportData.title.replace(/\s+/g, '_')}_${formatDateForFileName(reportData.generatedAt)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Helper function to format date for filename
const formatDateForFileName = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format execution report data
export const formatExecutionReportData = (
  executions: any[],
  filters: Record<string, string>,
  stats: { total: number; passed: number; failed: number; blocked: number; skipped: number }
): ReportData => {
  return {
    title: 'Test Execution Report',
    subtitle: 'QA Dashboard',
    generatedAt: new Date(),
    filters,
    summary: {
      'Total Executions': stats.total,
      'Passed': stats.passed,
      'Failed': stats.failed,
      'Blocked': stats.blocked,
      'Skipped': stats.skipped,
      'Pass Rate': `${stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}%`,
    },
    columns: [
      { header: 'Test Case', key: 'testCase', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Executed By', key: 'executedBy', width: 25 },
      { header: 'Executed At', key: 'executedAt', width: 20 },
      { header: 'Duration', key: 'duration', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 },
    ],
    rows: executions.map((exec) => ({
      testCase: exec.testCase?.title || '-',
      status: exec.status,
      executedBy: exec.executedBy
        ? `${exec.executedBy.firstName} ${exec.executedBy.lastName}`
        : '-',
      executedAt: exec.executedAt
        ? new Date(exec.executedAt).toLocaleString()
        : '-',
      duration: exec.executionTime ? `${exec.executionTime}s` : '-',
      notes: exec.notes || '-',
    })),
  };
};

// Format bug report data
export const formatBugReportData = (
  bugs: any[],
  filters: Record<string, string>,
  stats: { total: number; open: number; inProgress: number; fixed: number; closed: number; critical: number; high: number }
): ReportData => {
  return {
    title: 'Bug Summary Report',
    subtitle: 'QA Dashboard',
    generatedAt: new Date(),
    filters,
    summary: {
      'Total Bugs': stats.total,
      'Open': stats.open,
      'In Progress': stats.inProgress,
      'Fixed': stats.fixed,
      'Closed': stats.closed,
      'Critical': stats.critical,
      'High Priority': stats.high,
    },
    columns: [
      { header: 'Bug ID', key: 'bugId', width: 15 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Severity', key: 'severity', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Assigned To', key: 'assignedTo', width: 25 },
      { header: 'Reported By', key: 'reportedBy', width: 25 },
      { header: 'Created', key: 'createdAt', width: 20 },
      { header: 'Age (days)', key: 'age', width: 12 },
    ],
    rows: bugs.map((bug) => ({
      bugId: `BUG-${bug.bugNumber}`,
      title: bug.title,
      severity: bug.severity,
      status: bug.status,
      assignedTo: bug.assignedTo
        ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}`
        : 'Unassigned',
      reportedBy: bug.reportedBy
        ? `${bug.reportedBy.firstName} ${bug.reportedBy.lastName}`
        : '-',
      createdAt: new Date(bug.createdAt).toLocaleDateString(),
      age: Math.floor(
        (Date.now() - new Date(bug.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
  };
};
