import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Login.css';
import logo from '../assets/CobconnectLogo.png';
import logoText from '../assets/textLogo.png';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const db = getFirestore();

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const q = query(collection(db, 'admin'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setError('No account found with this email');
    } else {
      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      if (adminData.password === password) {
        navigate('/dashboard');
      } else {
        setError('Incorrect password');
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    setError('Login failed. Please try again');
  } finally {
    setLoading(false);
  }
};

  const getErrorMessage = (code) => {
    switch(code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      default:
        return 'Login failed. Please try again';
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="logo-container">
          <img src={logo} className="logo" alt="Logo" />
          <img src={logoText} className="logoText" alt="Cobconnect" />
        </div>
      </div>  
      <div className="right-side">
        <div className="login-form">
          <h2>Login</h2>
          <h3>Welcome, Admin!</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-container">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="checkbox-container">
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe">Remember me</label>
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;