import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import '../css/ForgotPassword.css';
import logo from '../assets/CobconnectLogo.png';
import logoText from '../assets/textLogo.png';
import privacy from '../assets/forgotpassword.png';
import emailIcon from '../assets/email.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message);
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-screen">
        <div className="navbar">
            <div className="logo-group">
            <img src={logo} alt="logo" className="navbar-logo" />
            <img src={logoText} alt="CobConnect" className="navbar-logo-text" />
        </div>
        <button className="exit-button" onClick={() => navigate('/')}>×</button>
    </div>

    <div className="forgot-password-card">
        <div className="title">FORGOT <br /> PASSWORD</div>
        <img src={privacy} alt="Lock Icon" className="lock-icon" />
        <div className="subtitle">Trouble Logging in?</div>
        <div className="instructions">Enter your email and we’ll send you<br />a link to reset your password</div>

        <form className="password-form" onSubmit={handleResetPassword}>
        <div className="input-group">
            <img src={emailIcon} alt="Email Icon" />
            <input type="email" className="email-input" placeholder="Email" required />
        </div>
        <button className="reset-button" type="submit">Reset Password</button>
        </form>
    </div>
    </div>
  );
};

export default ForgotPassword;
