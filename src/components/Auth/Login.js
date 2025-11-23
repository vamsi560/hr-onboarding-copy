import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useToast } from '../../context/ToastContext';
import './Login.css';

const Login = ({ onLogin, onDemo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const checkPasswordStrength = (value) => {
    if (value.length === 0) {
      setPasswordStrength('');
      return;
    }
    if (value.length < 6) setPasswordStrength('weak');
    else if (value.length < 10) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    onLogin();
    showToast('Login successful!', 'success');
  };

  return (
    <div className="login-wrap">
      <div className="login-background">
        <div className="login-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className={`login-container ${isAnimating ? 'animate-in' : ''}`}>
        <div className="login-header">
          <div className="login-logo">
            <img 
              src={process.env.PUBLIC_URL + "/images/ValueMomentum_logo.png"} 
              alt="ValueMomentum Logo" 
              className="logo-image"
            />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Streamline your onboarding journey with our intelligent platform
          </p>
        </div>

        <Card className="login-card">
          <div className="login-card-header">
            <h2>Sign In to Continue</h2>
            <p className="login-description">
              Access your onboarding portal to complete your joining formalities
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                required
                className="login-input"
              />
              {passwordStrength && (
                <div className="password-strength-container">
                  <div className={`password-strength ${passwordStrength}`}>
                    <div className="password-strength-bar"></div>
                  </div>
                  <span className={`password-strength-text ${passwordStrength}`}>
                    {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'medium' ? 'Medium' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <div className="login-actions">
              <Button type="submit" className="login-button-primary">
                Sign In
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onDemo}
                className="login-button-demo"
              >
                Try Demo Mode
              </Button>
            </div>
          </form>

          <div className="login-footer">
            <p className="login-help-text">
              Need assistance? Contact <a href="mailto:hr@valuemomentum.com">hr@valuemomentum.com</a>
            </p>
          </div>
        </Card>

        <div className="login-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-text">
              <strong>Document Management</strong>
              <span>Upload & organize with ease</span>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-text">
              <strong>AI Validation</strong>
              <span>Automated document verification</span>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="feature-text">
              <strong>Quick Onboarding</strong>
              <span>Complete in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

