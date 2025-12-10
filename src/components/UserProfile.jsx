import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../css/UserProfile.css';

const UserProfile = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateUrls, setCertificateUrls] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [certificateIndex, setCertificateIndex] = useState(0);

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
            rating: userData.ratings || 'Not rated yet',
            isBanned: userData.isBanned || false,
            profileImg: userData.profileImg || null,
            verification: userData.verification || 'pending'
          });

          if (type === 'cobbler') {
            const imagesRef = collection(db, `${type}s`, id, 'images');
            const imagesSnap = await getDocs(imagesRef);

            if (!imagesSnap.empty) {
              const urls = imagesSnap.docs
                .map(doc => doc.data().imgUrl)
                .filter(url => url);
              setCertificateUrls(urls);
            }

            const feedbackRef = collection(db, "Feedback");
            const feedbackSnap = await getDocs(feedbackRef);

            const result = feedbackSnap.docs
              .map(doc => doc.data())
              .filter(fb => fb.cobblerId === id)
              .filter(fb => {
                const hasBody = fb.body && fb.body.trim() !== "";
                const hasRating = fb.stars && fb.stars > 0;

                return hasBody || hasRating;  
              })
              .sort((a, b) => {
                if (!a.timestamp) return 1;
                if (!b.timestamp) return -1;
                return b.timestamp.toDate() - a.timestamp.toDate();
              })
              .map(fb => ({
                body: fb.body || "",
                stars: fb.stars || 0,
                timestamp: fb.timestamp || null
              }));

            setFeedbacks(result);
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
      `Are you sure you want to ${status} this user as cobbler?`
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

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;

    let stars = "★".repeat(full);
    if (half) stars += "⯪";

    return stars;
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
      navigate('/accountselection');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  if (loading) return (
    <div className="user-profile-container">
      <button className="close-btn-top-right" onClick={() => navigate(-1)}>×</button>
      <div className="loading">Loading user data...</div>
    </div>
  );

  if (error) return (
    <div className="user-profile-container">
      <button className="close-btn-top-right" onClick={() => navigate(-1)}>×</button>
      <div className="error">{error}</div>
    </div>
  );

  if (!user) return (
    <div className="user-profile-container">
      <button className="close-btn-top-right" onClick={() => navigate(-1)}>×</button>
      <div className="error">User not found</div>
    </div>
  );

  return (
    <div className="user-profile-container">
      <button className="close-btn-top-right" onClick={() => navigate(-1)}>×</button>

      <div className="user-profile-content">
        <header className="profile-header">
          <h1>{user.type === 'cobbler' ? 'Cobbler' : 'Customer'} Profile</h1>
        </header>

        <div className="profile-card">
          <div className="profile-main-info">
            {user.profileImg ? (
              <img 
                src={user.profileImg} 
                alt="Profile" 
                className="profile-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const defaultAvatar = document.createElement('div');
                  defaultAvatar.className = 'profile-image-default';
                  defaultAvatar.innerHTML = '<i class="fas fa-user"></i>';
                  e.target.parentNode.appendChild(defaultAvatar);
                }}
              />
            ) : (
              <div className="profile-image-default">
                <i className="fas fa-user"></i>
              </div>
            )}

            <div className="profile-name-email">
              <h2>{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              <span className="user-type-badge">{user.type.toUpperCase()}</span>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail">
              <h3><i className="fas fa-star"></i> Rating</h3>
              <p>
                {user.rating === "Not rated yet"
                  ? "Not rated yet"
                  : `${user.rating} ${renderStars(parseFloat(user.rating))}`}
              </p>
            </div>

            <div className="profile-detail">
              <h3><i className="fas fa-phone"></i> Phone number</h3>
              <p>{user.phone}</p>
            </div>

            <div className="profile-detail">
              <h3><i className="fas fa-map-marker-alt"></i> Address</h3>
              <p>{user.address}</p>
            </div>

            <div className="profile-detail">
              <h3><i className="fas fa-user-check"></i> Status</h3>
              <p className={user.isBanned ? 'status-banned' : 'status-active'}>
                {user.isBanned ? 'Banned' : 'Active'}
              </p>
            </div>

            {user.type === 'cobbler' && certificateUrls.length > 0 && (
              <div className="profile-detail">
                <h3><i className="fas fa-certificate"></i> Certificates</h3>
                <div className="certificate-list">
                  {certificateUrls.map((url, index) => (
                    <button 
                      key={index}
                      className="view-certificate-btn"
                      onClick={() => {
                        setCertificateIndex(index);
                        setShowModal(true);
                      }}
                    >
                      View Certificate {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {user.type === 'cobbler' && user.verification?.toLowerCase() === 'pending' && (
              <div className="profile-detail">
                <h3><i className="fas fa-shield-alt"></i> Verification</h3>
                <p className="verification-pending">Pending</p>
                <div className="verification-buttons">
                  <button 
                    className="action-btn accept-btn" 
                    onClick={() => handleVerification('Accepted')}
                  >
                    <i className="fas fa-check"></i> Accept
                  </button>
                  <button 
                    className="action-btn decline-btn" 
                    onClick={() => handleVerification('Declined')}
                  >
                    <i className="fas fa-times"></i> Decline
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="action-btn reset-pass-btn" onClick={handleResetPassword}>
              <i className="fas fa-key"></i> Reset Password
            </button>
            <button className="action-btn reset-btn" onClick={handleResetEmail}>
              <i className="fas fa-envelope"></i> Reset Email
            </button>
            <button className="action-btn ban-btn" onClick={handleBanAccount}>
              <i className="fas fa-ban"></i> {user.isBanned ? 'Unban Account' : 'Ban Account'}
            </button>
            <button className="action-btn delete-btn" onClick={handleDeleteAccount}>
              <i className="fas fa-trash-alt"></i> Delete Account
            </button>
          </div>
        </div>

        {user.type === "cobbler" && (
          <div className="feedback-card">
            <h3> Feedbacks</h3>

            {feedbacks.length === 0 ? (
              <p className="no-feedback">No feedback available yet.</p>
            ) : (
              <div className="feedback-list">
                {feedbacks.map((fb, index) => (
                  <div className="feedback-item" key={index}>
                    <div className="feedback-header">
                      <span className="feedback-rating">{"★".repeat(fb.stars)}</span>
                    </div>

                    <p className="feedback-body">{fb.body}</p>

                    <small className="feedback-date">
                      {fb.timestamp?.toDate
                        ? fb.timestamp.toDate().toLocaleString()
                        : ""}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={certificateUrls[certificateIndex]}
                alt="Certificate"
                className="modal-image"
              />
              {certificateUrls.length > 1 && (
                <div className="modal-nav">
                  <button 
                    className="nav-btn"
                    onClick={() =>
                      setCertificateIndex((certificateIndex - 1 + certificateUrls.length) % certificateUrls.length)
                    }
                  >
                    ‹
                  </button>

                  <button 
                    className="nav-btn"
                    onClick={() =>
                      setCertificateIndex((certificateIndex + 1) % certificateUrls.length)
                    }
                  >
                    ›
                  </button>
                </div>
              )}

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
