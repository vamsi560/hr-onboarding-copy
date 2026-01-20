import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRAnalytics.css';

const HRAnalytics = () => {
  const { logAction } = useApp();
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [hiringLeadFilter, setHiringLeadFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extended candidate data with analytics information - All Indian names
  const analyticsData = [
    {
      id: 1,
      name: 'Sai Surya Vamsi Sapireddy',
      position: 'Python Developer',
      department: 'Technical Department',
      hiringLead: 'Raghavendra Raju',
      offerDate: '05/07/2024',
      acceptDate: '05/08/2024',
      onboardingProgress: 90,
      tasksCompleted: 11,
      tasksTotal: 20
    },
    {
      id: 2,
      name: 'Shashank Tudum',
      position: 'DevOps Engineer',
      department: 'Technical Department',
      hiringLead: 'Raghavendra Raju',
      offerDate: '05/08/2024',
      acceptDate: '05/09/2024',
      onboardingProgress: 50,
      tasksCompleted: 18,
      tasksTotal: 40
    },
    {
      id: 3,
      name: 'Pankaj Kumar',
      position: 'Sales Manager',
      department: 'Sales Department',
      hiringLead: 'Supriya Rangdal',
      offerDate: '05/10/2024',
      acceptDate: '05/12/2024',
      onboardingProgress: 60,
      tasksCompleted: 5,
      tasksTotal: 9
    },
    {
      id: 4,
      name: 'Kavya',
      position: 'Sales Manager',
      department: 'Sales Department',
      hiringLead: 'Supriya Rangdal',
      offerDate: '05/12/2024',
      acceptDate: '05/14/2024',
      onboardingProgress: 55,
      tasksCompleted: 18,
      tasksTotal: 50
    },
    {
      id: 5,
      name: 'Arjun Reddy',
      position: 'Sales Manager',
      department: 'Sales Department',
      hiringLead: 'Kavya',
      offerDate: '05/15/2024',
      acceptDate: '05/16/2024',
      onboardingProgress: 59,
      tasksCompleted: 2,
      tasksTotal: 7
    },
    {
      id: 6,
      name: 'Priya Sharma',
      position: 'Sales Manager',
      department: 'Sales Department',
      hiringLead: 'Raghavendra Raju',
      offerDate: '06/03/2024',
      acceptDate: '06/05/2024',
      onboardingProgress: 47,
      tasksCompleted: 2,
      tasksTotal: 9
    },
    {
      id: 7,
      name: 'Rahul Mehta',
      position: 'Full Stack Developer',
      department: 'Technical Department',
      hiringLead: 'Raghavendra Raju',
      offerDate: '06/10/2024',
      acceptDate: '06/12/2024',
      onboardingProgress: 75,
      tasksCompleted: 15,
      tasksTotal: 20
    },
    {
      id: 8,
      name: 'Ananya Patel',
      position: 'HR Manager',
      department: 'HR Department',
      hiringLead: 'Supriya Rangdal',
      offerDate: '06/15/2024',
      acceptDate: '06/17/2024',
      onboardingProgress: 65,
      tasksCompleted: 13,
      tasksTotal: 20
    },
    {
      id: 9,
      name: 'Vikram Singh',
      position: 'Data Engineer',
      department: 'Technical Department',
      hiringLead: 'Raghavendra Raju',
      offerDate: '06/20/2024',
      acceptDate: '06/22/2024',
      onboardingProgress: 80,
      tasksCompleted: 16,
      tasksTotal: 20
    },
    {
      id: 10,
      name: 'Meera Desai',
      position: 'Product Manager',
      department: 'Product Department',
      hiringLead: 'Supriya Rangdal',
      offerDate: '06/25/2024',
      acceptDate: '06/27/2024',
      onboardingProgress: 70,
      tasksCompleted: 14,
      tasksTotal: 20
    },
    {
      id: 11,
      name: 'Aditya Nair',
      position: 'Frontend Developer',
      department: 'Technical Department',
      hiringLead: 'Kavya',
      offerDate: '07/01/2024',
      acceptDate: '07/03/2024',
      onboardingProgress: 65,
      tasksCompleted: 13,
      tasksTotal: 20
    },
    {
      id: 12,
      name: 'Sneha Iyer',
      position: 'Business Analyst',
      department: 'Business Department',
      hiringLead: 'Supriya Rangdal',
      offerDate: '07/05/2024',
      acceptDate: '07/07/2024',
      onboardingProgress: 58,
      tasksCompleted: 12,
      tasksTotal: 21
    }
  ];

  const filteredData = analyticsData.filter(row => {
    const matchesDept = !departmentFilter || row.department === departmentFilter;
    const matchesLead = !hiringLeadFilter || row.hiringLead === hiringLeadFilter;

    // Date range filter based on offerDate (MM/DD/YYYY)
    const today = new Date();
    const offer = new Date(row.offerDate);
    let matchesDate = true;
    if (!isNaN(offer.getTime())) {
      const diffDays = (today - offer) / (1000 * 60 * 60 * 24);
      if (dateRangeFilter === 'week') matchesDate = diffDays <= 7;
      else if (dateRangeFilter === 'month') matchesDate = diffDays <= 30;
      else if (dateRangeFilter === 'year') matchesDate = diffDays <= 365;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      !lowerSearch ||
      row.name.toLowerCase().includes(lowerSearch) ||
      row.position.toLowerCase().includes(lowerSearch) ||
      row.department.toLowerCase().includes(lowerSearch) ||
      row.hiringLead.toLowerCase().includes(lowerSearch);

    return matchesDept && matchesLead && matchesDate && matchesSearch;
  });

  // Calculate KPIs (simple demo based on filtered data)
  const kpis = {
    offersToSend: 55,
    timeToAccept: '1 day',
    timeToOnboard: '12 days',
    onboarded: filteredData.length,
    offerAcceptanceRatio:
      filteredData.length > 0
        ? Math.round(
            filteredData.reduce((sum, r) => sum + r.onboardingProgress, 0) /
              filteredData.length
          )
        : 0,
    applicationsReceived: 11265,
    applicationsGrowth: 53
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? -1 : 1;
    }
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Position', 'Department', 'Hiring Lead', 'Offer Date', 'Accept Date', 'Onboarding Progress', 'Tasks Completed', 'Tasks Total'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        `"${row.name}"`,
        `"${row.position}"`,
        `"${row.department}"`,
        `"${row.hiringLead}"`,
        row.offerDate,
        row.acceptDate,
        `${row.onboardingProgress}%`,
        row.tasksCompleted,
        row.tasksTotal
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidate_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (logAction) {
      logAction('export_csv', { filename: `candidate_analytics_${new Date().toISOString().split('T')[0]}.csv` });
    }
  };

  const exportToPDF = () => {
    // Simple PDF generation using window.print() or a library
    // For a production app, you'd use jsPDF or similar
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Candidate Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Candidate Analytics Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Hiring Lead</th>
                <th>Offer Date</th>
                <th>Accept Date</th>
                <th>Onboarding Progress</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>${row.position}</td>
                  <td>${row.department}</td>
                  <td>${row.hiringLead}</td>
                  <td>${row.offerDate}</td>
                  <td>${row.acceptDate}</td>
                  <td>${row.onboardingProgress}%</td>
                  <td>${row.tasksCompleted}/${row.tasksTotal}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    
    if (logAction) {
      logAction('export_pdf', { timestamp: new Date().toISOString() });
    }
  };

  return (
    <div className="hr-analytics">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Analytics' }]} />
      <div className="analytics-header">
        <h1>Analytics</h1>
        <div className="export-buttons">
          <Button variant="secondary" onClick={exportToCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={exportToPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <input
          type="text"
          className="analytics-search"
          placeholder="Search by name, position, department, hiring lead..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {[...new Set(analyticsData.map(a => a.department))].map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={hiringLeadFilter}
          onChange={(e) => setHiringLeadFilter(e.target.value)}
        >
          <option value="">All Hiring Leads</option>
          {[...new Set(analyticsData.map(a => a.hiringLead))].map(lead => (
            <option key={lead} value={lead}>{lead}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-label">Pending</div>
          <div className="kpi-value">{filteredData.length}</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-label">Onboarded</div>
          <div className="kpi-value">{kpis.onboarded}</div>
        </Card>

        <Card className="kpi-card kpi-card-chart">
          <div className="kpi-label">Offer Acceptance Ratio</div>
          <div className="donut-chart-container">
            <div className="donut-chart">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="#e9ecef"
                  strokeWidth="12"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="#007bff"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - kpis.offerAcceptanceRatio / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
                <text x="40" y="46" textAnchor="middle" fontSize="18" fill="#007bff">{kpis.offerAcceptanceRatio}%</text>
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Table */}
      <Card className="analytics-table-card">
        <table className="analytics-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name <span className="sort-icon">{getSortIcon('name')}</span>
              </th>
              <th onClick={() => handleSort('position')}>
                Position <span className="sort-icon">{getSortIcon('position')}</span>
              </th>
              <th onClick={() => handleSort('department')}>
                Department <span className="sort-icon">{getSortIcon('department')}</span>
              </th>
              <th onClick={() => handleSort('hiringLead')}>
                Hiring Lead <span className="sort-icon">{getSortIcon('hiringLead')}</span>
              </th>
              <th onClick={() => handleSort('offerDate')}>
                Offer Date <span className="sort-icon">{getSortIcon('offerDate')}</span>
              </th>
              <th onClick={() => handleSort('acceptDate')}>
                Accept Date <span className="sort-icon">{getSortIcon('acceptDate')}</span>
              </th>
              <th>Onboarding Progress</th>
              <th>Tasks</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.position}</td>
                <td>{candidate.department}</td>
                <td>{candidate.hiringLead}</td>
                <td>{candidate.offerDate}</td>
                <td>{candidate.acceptDate}</td>
                <td>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill onboarding"
                        style={{ width: `${candidate.onboardingProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{candidate.onboardingProgress}%</span>
                  </div>
                </td>
                <td>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill tasks"
                        style={{ width: `${(candidate.tasksCompleted / candidate.tasksTotal) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {candidate.tasksCompleted}/{candidate.tasksTotal}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default HRAnalytics;

