import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';
import Breadcrumbs from '../UI/Breadcrumbs';
import Button from '../UI/Button';
import Icon from '../UI/Icon';
import './Validation.css';

const Validation = () => {
  const { validationHistory } = useApp();
  const [expandedItems, setExpandedItems] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'invalid':
        return 'var(--error)';
      case 'pending':
        return 'var(--muted)';
      default:
        return 'var(--muted)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return '✓';
      case 'warning':
        return '⚠';
      case 'invalid':
        return '×';
      case 'pending':
        return '⏳';
      default:
        return '?';
    }
  };

  const getCheckStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'fail':
        return 'var(--error)';
      default:
        return 'var(--muted)';
    }
  };

  const filteredHistory = filterStatus === 'all' 
    ? validationHistory 
    : validationHistory.filter(v => v.status === filterStatus);

  const stats = {
    total: validationHistory.length,
    valid: validationHistory.filter(v => v.status === 'valid').length,
    warning: validationHistory.filter(v => v.status === 'warning').length,
    invalid: validationHistory.filter(v => v.status === 'invalid').length
  };

  return (
    <div className="validation">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'AI Document Validation' }]} />
      
      {/* Statistics Cards */}
      {validationHistory.length > 0 && (
        <div className="validation-stats">
          <Card className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Validations</div>
          </Card>
          <Card className="stat-card stat-valid">
            <div className="stat-value">{stats.valid}</div>
            <div className="stat-label">Valid</div>
          </Card>
          <Card className="stat-card stat-warning">
            <div className="stat-value">{stats.warning}</div>
            <div className="stat-label">Warnings</div>
          </Card>
          <Card className="stat-card stat-invalid">
            <div className="stat-value">{stats.invalid}</div>
            <div className="stat-label">Invalid</div>
          </Card>
        </div>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>AI Validation Results</h3>
          {validationHistory.length > 0 && (
            <div className="validation-filters">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('all')}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={filterStatus === 'valid' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('valid')}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Valid ({stats.valid})
              </Button>
              <Button
                variant={filterStatus === 'warning' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('warning')}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Warnings ({stats.warning})
              </Button>
              <Button
                variant={filterStatus === 'invalid' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('invalid')}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Invalid ({stats.invalid})
              </Button>
            </div>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <div>
              {validationHistory.length === 0 
                ? 'No validation results yet. Upload documents to see AI validation.'
                : `No ${filterStatus === 'all' ? '' : filterStatus} validation results found.`}
            </div>
          </div>
        ) : (
          <div className="validation-timeline">
            {filteredHistory.map((validation, index) => {
              const isExpanded = expandedItems[index];
              const originalIndex = validationHistory.indexOf(validation);
              
              return (
                <Card key={originalIndex} className={`timeline-item validation-item status-${validation.status}`}>
                  <div className="validation-header" onClick={() => toggleExpand(originalIndex)}>
                    <div className="validation-header-left">
                      <div className="validation-status-badge" style={{ backgroundColor: getStatusColor(validation.status) }}>
                        <span className="status-icon">{getStatusIcon(validation.status)}</span>
                        <span className="status-text">{validation.status.toUpperCase()}</span>
                      </div>
                      <div className="validation-doc-info">
                        <strong>{validation.documentName || validation.document}</strong>
                        <div className="small" style={{ marginTop: '4px', color: 'var(--muted)' }}>
                          {validation.documentType} • {new Date(validation.uploadedAt || validation.date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="validation-header-right">
                      <div className="confidence-score-large" style={{ 
                        backgroundColor: validation.overallConfidence >= 80 ? 'var(--success)' : 
                                         validation.overallConfidence >= 50 ? 'var(--warning)' : 'var(--error)'
                      }}>
                        {validation.overallConfidence || validation.confidence}%
                      </div>
                      <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={20} style={{ marginLeft: '12px' }} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="validation-details">
                      {/* Validation Checks */}
                      {validation.checks && (
                        <div className="validation-checks">
                          <h4>Validation Checks</h4>
                          <div className="checks-grid">
                            {Object.entries(validation.checks).map(([checkName, checkResult]) => (
                              <div key={checkName} className="check-item">
                                <div className="check-header">
                                  <span className="check-name">{checkName.charAt(0).toUpperCase() + checkName.slice(1)}</span>
                                  <span 
                                    className="check-status"
                                    style={{ color: getCheckStatusColor(checkResult.status) }}
                                  >
                                    {checkResult.status === 'pass' ? '✓' : checkResult.status === 'fail' ? '×' : '⚠'}
                                  </span>
                                </div>
                                <div className="check-message">{checkResult.message}</div>
                                {checkResult.confidence !== undefined && (
                                  <div className="check-confidence">
                                    Confidence: {checkResult.confidence}%
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Field Comparisons */}
                      {validation.fieldComparisons && validation.fieldComparisons.length > 0 && (
                        <div className="field-comparison-section">
                          <h4>Field Comparison</h4>
                          <div className="field-comparison">
                            {validation.fieldComparisons.map((field, idx) => (
                              <div key={idx} className={`comparison-item ${field.match ? 'match' : 'mismatch'}`}>
                                <div className="comparison-field-name">
                                  <strong>{field.fieldName}</strong>
                                  <span className={`match-badge ${field.match ? 'matched' : 'mismatched'}`}>
                                    {field.match ? '✓ MATCH' : '× MISMATCH'}
                                  </span>
                                </div>
                                <div className="comparison-values">
                                  <div className="comparison-value">
                                    <span className="value-label">Form:</span>
                                    <span className="value-text">{field.formValue}</span>
                                  </div>
                                  <div className="comparison-value">
                                    <span className="value-label">Document:</span>
                                    <span className="value-text">{field.documentValue}</span>
                                  </div>
                                </div>
                                {field.discrepancy && (
                                  <div className="discrepancy-note">
                                    {field.discrepancy}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extracted Data */}
                      {validation.extractedData && Object.keys(validation.extractedData).length > 0 && (
                        <div className="extracted-data-section">
                          <h4>Extracted Data</h4>
                          <div className="extracted-data-grid">
                            {Object.entries(validation.extractedData).map(([key, value]) => (
                              <div key={key} className="extracted-field">
                                <span className="extracted-key">{key}:</span>
                                <span className="extracted-value">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Issues */}
                      {validation.issues && validation.issues.length > 0 && (
                        <div className="issues-section">
                          <h4>Issues & Warnings</h4>
                          <div className="issues-list">
                            {validation.issues.map((issue, idx) => (
                              <div key={idx} className={`issue-item issue-${issue.severity}`}>
                                <div className="issue-header">
                                  <span className="issue-severity">{issue.severity.toUpperCase()}</span>
                                  <span className="issue-category">{issue.category}</span>
                                </div>
                                <div className="issue-message">{issue.message}</div>
                                {issue.field && (
                                  <div className="issue-field">Field: {issue.field}</div>
                                )}
                                {issue.suggestion && (
                                  <div className="issue-suggestion">
                                    <strong>Suggestion:</strong> {issue.suggestion}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {validation.recommendations && validation.recommendations.length > 0 && (
                        <div className="recommendations-section">
                          <h4>Recommendations</h4>
                          <ul className="recommendations-list">
                            {validation.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="validation-metadata">
                        <div className="metadata-item">
                          <span className="metadata-label">Processing Time:</span>
                          <span className="metadata-value">{validation.processingTime || 0}ms</span>
                        </div>
                        {validation.aiModel && (
                          <div className="metadata-item">
                            <span className="metadata-label">AI Model:</span>
                            <span className="metadata-value">{validation.aiModel}</span>
                          </div>
                        )}
                        {validation.version && (
                          <div className="metadata-item">
                            <span className="metadata-label">Version:</span>
                            <span className="metadata-value">{validation.version}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Validation;

