import React, { useState } from 'react';
import './ResetPassword.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import airlogo from '../../Assets/airlogo.png';
import { httpRequest } from '../../api/http.js';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(newPassword)) {
      setError('Min 8 chars, include number and special character');
      return;
    }

    try {
      setLoading(true);
      await httpRequest('/auth/reset-password', {
        method: 'PUT',
        body: { token, password: newPassword }
      });
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ResetPassword">
      <div className="ResetPassword-container">
        <div className="ResetPassword-card">
          {/* Form Section */}
          <div className="ResetPassword-form-section">
            <img src={airlogo} alt="Air University Logo" style={{ width: '150px', marginBottom: '20px' }} />
            <h2 className="ResetPassword-title">Reset Password</h2>
            <form className='ResetPassword-form' onSubmit={handleSubmit}>
              <label className='ResetPassword-label'>
                New Password:
              </label>
              <input 
                className='ResetPassword-input' 
                type="password" 
                name="newPassword" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
              <label className='ResetPassword-label'>
                Confirm New Password:
              </label>
              <input 
                className='ResetPassword-input' 
                type="password" 
                name="confirmNewPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              {error && <p className="text-danger text-center">{error}</p>}
              {success && <p className="text-success text-center">{success}</p>}
              <button type="submit" className='ResetPassword-button' disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
          {/* Divider */}
          <div className="ResetPassword-vertical-divider"></div>
          {/* Illustration Section */}
          <div className="ResetPassword-illustration-section">
            <img src={airlogo} alt="Air University Logo" className="ResetPassword-logo" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
