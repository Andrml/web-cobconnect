import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import '../css/Announcement.css';
import logo from '../assets/CobconnectLogo.png';
import logotext from '../assets/textLogo.png';
import { FiHome, FiBell, FiUsers, FiLogOut } from 'react-icons/fi';

const Announcement = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);

  const announcementsRef = collection(db, 'announcements');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(announcementsRef, (snapshot) => {
      const announcementsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      announcementsList.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      setAnnouncements(announcementsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (newAnnouncement.trim()) {
      try {
        await addDoc(announcementsRef, {
          title: 'New Announcement',
          content: newAnnouncement,
          timestamp: serverTimestamp(),
          date: 'Today'
        });
        setNewAnnouncement('');
      } catch (error) {
        console.error('Error posting announcement:', error);
        alert('Failed to post announcement');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Today';
    const now = new Date();
    const postDate = timestamp.toDate();
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  return (
    <div className="announcement-container">
      <div className="sidebar">
        <div className="logo-wrapper">
          <img src={logo} alt="Logo" className="logo-img" />
          <img src={logotext} alt="cobconnect" className="logo-text-img" />
        </div>
        <nav>
          <ul>
            <li onClick={() => navigate('/dashboard')}>
              <FiHome className="nav-icon" /> Dashboard
            </li>
            <li className="active" onClick={() => navigate('/announcement')}>
              <FiBell className="nav-icon" /> Announcements
            </li>
            <li onClick={() => navigate('/accountselection')}>
              <FiUsers className="nav-icon" /> Manage Accounts
            </li>
          </ul>
          <div className="logout-section">
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut className="nav-icon" /> Log Out
            </button>
          </div>
        </nav>
      </div>

      <div className="main-content">
        <h1 className="announcement-title">Announcements</h1>

        <section className="post-container">
          <textarea
            className="announcement-input"
            placeholder="Type your announcement here..."
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
          />
          <button className="post-button" onClick={handlePost}>
            Post Announcement
          </button>
        </section>

        <div className="scrollable-list-container">
          {loading ? (
            <p>Loading announcements...</p>
          ) : (
            <section className="announcements-list">
              {announcements.map((item) => (
                <article key={item.id} className="announcement-card">
                  <div className="announcement-header">
                    <h3>{item.title}</h3>
                    <span className="announcement-date">
                      Update: {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <p className="announcement-text">{item.content}</p>
                </article>
              ))}
            </section>
          )}
        </div>

        <footer className="announcement-footer">
          <p>©Copyright {new Date().getFullYear()} cobconnect.com</p>
        </footer>
      </div>
    </div>
  );
};

export default Announcement;
