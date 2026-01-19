import React, { useRef, useState, useEffect, useCallback } from 'react';
import Button from '../UI/Button';
import './DigitalSignature.css';

const DigitalSignature = ({ 
  onSave, 
  onClear, 
  value = '', 
  width = 400, 
  height = 200,
  required = false,
  label = "Digital Signature"
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'type'
  const [typedSignature, setTypedSignature] = useState(value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setTypedSignature('');
    if (onClear) onClear();
  };

  const saveSignature = () => {
    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL();
      if (onSave) onSave(dataURL, 'canvas');
    } else {
      if (onSave) onSave(typedSignature, 'text');
    }
  };

  const generateTypedSignature = useCallback(() => {
    if (!typedSignature.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set font style for signature
    ctx.font = '32px "Dancing Script", cursive, serif';
    ctx.fillStyle = '#2d3748';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw the typed signature
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
    setHasSignature(true);
  }, [typedSignature]);

  useEffect(() => {
    if (signatureType === 'type' && typedSignature) {
      generateTypedSignature();
    }
  }, [typedSignature, generateTypedSignature]);

  return (
    <div className="digital-signature-container">
      <label className="signature-label">
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className="signature-tabs">
        <button
          type="button"
          className={`tab ${signatureType === 'draw' ? 'active' : ''}`}
          onClick={() => setSignatureType('draw')}
        >
          ✏️ Draw
        </button>
        <button
          type="button"
          className={`tab ${signatureType === 'type' ? 'active' : ''}`}
          onClick={() => setSignatureType('type')}
        >
          ⌨️ Type
        </button>
      </div>

      {signatureType === 'type' && (
        <div className="typed-signature-input">
          <input
            type="text"
            placeholder="Type your full name"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            className="signature-text-input"
          />
        </div>
      )}

      <div className="signature-pad-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ 
            pointerEvents: signatureType === 'draw' ? 'auto' : 'none',
            opacity: signatureType === 'draw' ? 1 : 0.7
          }}
        />
        {!hasSignature && signatureType === 'draw' && (
          <div className="signature-placeholder">
            Sign here
          </div>
        )}
      </div>

      <div className="signature-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={clearSignature}
          disabled={!hasSignature && !typedSignature}
        >
          Clear
        </Button>
        <Button
          type="button"
          onClick={saveSignature}
          disabled={!hasSignature && !typedSignature}
        >
          Save Signature
        </Button>
      </div>
    </div>
  );
};

export default DigitalSignature;