import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Breadcrumbs from '../UI/Breadcrumbs';
import './HRReview.css';

const HRExceptions = () => {
  const { candidates } = useApp();

  return (
    <div className="hr-review">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Exceptions' }]} />
      <Card>
        <h3>Exceptions</h3>
        <p className="small">
          View pending information and missing documents for each candidate.
        </p>
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Pending items</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.status}</td>
                <td>
                  {candidate.pending && candidate.pending.length > 0
                    ? candidate.pending.join(', ')
                    : 'No exceptions'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default HRExceptions;


