import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../css/UserProfile.css';
import logo from '../assets/CobConnectLogo.png';
import logotext from '../assets/textLogo.png';

const UserProfile = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, `${type}s`, id);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            id: userSnap.id,
            type,
            name: `${userData.fName || ''} ${userData.lName || ''}`.trim(),
            email: userData.email || '',
            phone: userData.phone || 'Not provided',
            address: userData.address || 'Not provided',
            rating: userData.rating || 'Not rated yet',
            isBanned: userData.isBanned || false,
            profileImg: userData.profileImg || null,
            verification: userData.verification || 'pending'
          });
          if (type === 'cobbler') {
            const imagesRef = collection(db, `${type}s`, id, 'images');
            const imagesSnap = await getDocs(imagesRef);
            if (!imagesSnap.empty) {
              const imageData = imagesSnap.docs[0].data();
              if (imageData.imgUrl) {
                setCertificateUrl(imageData.imgUrl);
              }
            }
          }
        } else {
          setError('User not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [type, id]);

  const handleVerification = async (status) => {
    const confirm = window.confirm(
      `Are you sure you want to ${status} this cobbler?`
    );
    if (!confirm) return;
  
    try {
      const userRef = doc(db, `${type}s`, id);
      await updateDoc(userRef, { verification: status });
      setUser(prev => ({ ...prev, verification: status }));
      alert(`Cobbler ${status} successfully`);
    } catch (error) {
      console.error(`Error updating verification:`, error);
      alert('Failed to update verification status');
    }
  };
  
  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset email');
    }
  };

  const handleResetEmail = async () => {
    const newEmail = prompt('Enter new email address:');
    if (!newEmail) return;
    
    try {
      const userRef = doc(db, `${type}s`, id);
      await updateDoc(userRef, { email: newEmail });
      setUser(prev => ({ ...prev, email: newEmail }));
      alert('Email updated successfully');
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Failed to update email');
    }
  };

  const handleBanAccount = async () => {
    const confirmBan = window.confirm(
      `Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} this account?`
    );
    if (!confirmBan) return;
    
    try {
      const userRef = doc(db, `${type}s`, id);
      await updateDoc(userRef, { isBanned: !user.isBanned });
      setUser(prev => ({ ...prev, isBanned: !prev.isBanned }));
      alert(`Account ${user.isBanned ? 'unbanned' : 'banned'} successfully`);
    } catch (error) {
      console.error('Error banning account:', error);
      alert('Failed to update account status');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this account? This cannot be undone.'
    );
    if (!confirmDelete) return;
    
    try {
      const userRef = doc(db, `${type}s`, id);
      await deleteDoc(userRef);
      alert('Account deleted successfully');
      navigate('/admin/account-selection');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  if (loading) return <div className="loading">Loading user data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="user-profile-container">
      <nav className="user-profile-navbar">
        <div className="logo-wrapper">
          <img src={logo} alt="Logo" className="logo-img" />
          <img src={logotext} alt="cobconnect" className="logo-text-img" />
        </div>
        <button className="close-btn" onClick={() => navigate(-1)} aria-label="Close">
          ×
        </button>
      </nav>
      
      <div className="user-profile-content">
        <header className="profile-header">
          <h1>{user.type === 'cobbler' ? 'Cobbler' : 'Customer'} Profile</h1>
        </header>
        
        <div className="profile-card">
          <div className="profile-main-info">
            {user.profileImg && (
              <img 
                src={user.profileImg} 
                alt="Profile" 
                className="profile-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="profile-name-email">
              <h2>{user.name}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
          
          <div className="profile-details-grid">
            <div className="profile-detail">
              <h3>Rating</h3>
              <p>{user.rating}</p>
            </div>
            
            <div className="profile-detail">
              <h3>Phone number</h3>
              <p>{user.phone}</p>
            </div>
            
            <div className="profile-detail">
              <h3>Address</h3>
              <p>{user.address}</p>
            </div>
            
            <div className="profile-detail">
              <h3>Status</h3>
              <p className={user.isBanned ? 'status-banned' : 'status-active'}>
                {user.isBanned ? 'Banned' : 'Active'}
              </p>
            </div>
            
            {user.type === 'cobbler' && certificateUrl && (
              <div className="profile-detail">
                <h3>Certificate</h3>
                <p>
                  <button 
                    className="view-certificate-btn"
                    onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                  >
                    View Certificate
                  </button>
                </p>
              </div>
            )}
            
            {user.type === 'cobbler' && user.verification?.toLowerCase() === 'pending' && (
              <div className="profile-detail">
                <h3>Verification</h3>
                <p className="verification-pending">Pending</p>
                <div className="verification-buttons">
                  <button 
                    className="action-btn accept-btn" 
                    onClick={() => handleVerification('Accepted')}
                  >
                    Accept
                  </button>
                  <button 
                    className="action-btn decline-btn" 
                    onClick={() => handleVerification('Declined')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button 
              className="action-btn reset-btn" 
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
            <button 
              className="action-btn reset-btn" 
              onClick={handleResetEmail}
            >
              Reset Email
            </button>
            <button 
              className="action-btn ban-btn" 
              onClick={handleBanAccount}
            >
              {user.isBanned ? 'Unban Account' : 'Ban Account'}
            </button>
            <button 
              className="action-btn delete-btn" 
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
        
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={certificateUrl} 
                alt="Certificate"
                className="modal-image"
              />
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
          </div>
        )}
        
        <div className="user-profile-footer">
          ©Copyright {new Date().getFullYear()} cobconnect.com. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default UserProfile;