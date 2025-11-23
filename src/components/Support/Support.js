import React from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Breadcrumbs from '../UI/Breadcrumbs';

const Support = () => {
  return (
    <div className="support">
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Support' }]} />
      <Card>
        <h3>Support</h3>
        <p className="small">If you need help, contact HR or use the chat assistant.</p>
        <div style={{ marginTop: '12px' }}>
          <Button onClick={() => {/* Open chat */}}>Open Chat</Button>
        </div>
      </Card>
    </div>
  );
};

export default Support;

