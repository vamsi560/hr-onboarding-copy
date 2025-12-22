import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRAnalytics.css';

const HRAnalytics = () => {
  const { candidates, logAction } = useApp();
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Calculate KPIs
  const kpis = {
    offersToSend: 55,
    timeToAccept: '1 day',
    timeToOnboard: '12 days',
    onboarded: analyticsData.length,
    offerAcceptanceRatio: 65,
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

  const sortedData = [...analyticsData].sort((a, b) => {
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
      return aVal < bVal ? 1 : -1;
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

      {/* KPI Cards */}
      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-label">Offers to Send</div>
          <div className="kpi-value">{kpis.offersToSend}</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-label">Time to Accept</div>
          <div className="kpi-value">{kpis.timeToAccept}</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-label">Time to Onboard</div>
          <div className="kpi-value">{kpis.timeToOnboard}</div>
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
                  strokeWidth="8"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="8"
                  strokeDasharray={`${kpis.offerAcceptanceRatio * 1.884} 188.4`}
                  strokeDashoffset="47.1"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="donut-chart-value">{kpis.offerAcceptanceRatio}%</div>
            </div>
          </div>
        </Card>

        <Card className="kpi-card kpi-card-chart">
          <div className="kpi-label">Applications received</div>
          <div className="kpi-value-large">{kpis.applicationsReceived.toLocaleString()}</div>
          <div className="kpi-growth">
            <span className="growth-indicator positive">
              ↑ This month +{kpis.applicationsGrowth}%
            </span>
          </div>
          <div className="mini-bar-chart">
            {[20, 35, 28, 45, 38, 42, 53].map((height, index) => (
              <div
                key={index}
                className="bar"
                style={{ height: `${height}%` }}
              ></div>
            ))}
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
                <td>
                  <a 
                    href="#" 
                    className="candidate-name-link"
                    onClick={(e) => {
                      e.preventDefault();
                      // Could navigate to candidate detail page
                    }}
                  >
                    {candidate.name}
                  </a>
                </td>
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

