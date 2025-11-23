import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Breadcrumbs from '../UI/Breadcrumbs';
import './Validation.css';

const Validation = () => {
  const { validationHistory } = useApp();

  return (
    <div className="validation">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'AI Validation' }]} />
      <Card>
        <h3>AI Validation Results</h3>
        {validationHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">AI</div>
            <div>No validation results yet. Upload documents to see AI validation.</div>
          </div>
        ) : (
          <div className="validation-timeline">
            {validationHistory.map((validation, index) => (
              <Card key={index} className="timeline-item">
                <div className="flex" style={{ justifyContent: 'space-between' }}>
                  <div><strong>{validation.document}</strong></div>
                  <div className="small">{validation.date}</div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <strong>Confidence Score: <span className="confidence-score">{validation.confidence}%</span></strong>
                </div>
                <div className="field-comparison" style={{ marginTop: '12px' }}>
                  {validation.fields.map((field, idx) => (
                    <div key={idx} className="comparison-item">
                      <strong>{field.name}:</strong> {field.value}
                      <span style={{ color: field.match ? 'var(--success)' : 'var(--error)', marginLeft: '8px' }}>
                        {field.match ? '✓ MATCH' : '× MISMATCH'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Validation;

