const DASHBOARD_SAMPLE_DATA = {
  summary: {
    totalApplications: 2847,
    processing: 456,
    delivered: 2145,
    pendingReports: 28,
    resolvedReports: 142,
  },
  recentActivity: [
    {
      trn: 'TRN-2024-001234',
      applicantName: 'Maria Santos',
      activity: 'Status updated to For Delivery',
      date: '2025-02-25, 14:32',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001235',
      applicantName: 'Juan Dela Cruz',
      activity: 'Status updated to Printed',
      date: '2025-02-25, 14:19',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001236',
      applicantName: 'Ana Reyes',
      activity: 'Status updated to For Printing',
      date: '2025-02-25, 11:45',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001237',
      applicantName: 'Pedro Garcia',
      activity: 'Application verified',
      date: '2025-02-25, 10:22',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001238',
      applicantName: 'Sofia Martinez',
      activity: 'New applicant registered',
      date: '2025-02-25, 09:10',
      updatedBy: 'System',
    },
    {
      trn: 'TRN-2024-001239',
      applicantName: 'Carlos Lopez',
      activity: 'Status updated to Delivered',
      date: '2025-02-25, 08:30',
      updatedBy: 'Admin User',
    },
  ],
  applications: [
    {
      trn: 'TRN-2024-001234',
      applicantName: 'Maria Santos',
      registrationDate: '2025-01-10',
      status: 'For Delivery',
    },
    {
      trn: 'TRN-2024-001235',
      applicantName: 'Juan Dela Cruz',
      registrationDate: '2025-01-12',
      status: 'Printed',
    },
    {
      trn: 'TRN-2024-001236',
      applicantName: 'Ana Reyes',
      registrationDate: '2025-01-20',
      status: 'For Printing',
    },
    {
      trn: 'TRN-2024-001237',
      applicantName: 'Pedro Garcia',
      registrationDate: '2025-01-22',
      status: 'Verified',
    },
    {
      trn: 'TRN-2024-001238',
      applicantName: 'Sofia Martinez',
      registrationDate: '2025-01-20',
      status: 'Registered',
    },
    {
      trn: 'TRN-2024-001239',
      applicantName: 'Carlos Lopez',
      registrationDate: '2025-01-21',
      status: 'Delivered',
    },
  ],
};

function getDashboardSnapshot() {
  return DASHBOARD_SAMPLE_DATA;
}

module.exports = { getDashboardSnapshot };