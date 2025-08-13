import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { FiHome, FiBell, FiUsers, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import logo from '../assets/CobconnectLogo.png';
import textLogo from '../assets/textLogo.png';
import '../css/AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className={`admin-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <img src={logo} alt="Logo" className="logo-img" />
            <img src={textLogo} alt="CobConnect" className="logo-text-img" />
          </div>
        </div>

        <nav>
          <ul>
            <li 
              className={isActive('dashboard') ? 'active' : ''}
              onClick={() => navigate('/dashboard')}
              data-tooltip="Dashboard"
            >
              <FiHome className="nav-icon" />
              <span>Dashboard</span>
            </li>
            <li 
              className={isActive('announcement') ? 'active' : ''}
              onClick={() => navigate('/announcement')}
              data-tooltip="Announcements"
            >
              <FiBell className="nav-icon" />
              <span>Announcements</span>
            </li>
            <li 
              className={isActive('accountselection') || isActive('user-profile') ? 'active' : ''}
              onClick={() => navigate('/accountselection')}
              data-tooltip="Manage Accounts"
            >
              <FiUsers className="nav-icon" />
              <span>Manage Accounts</span>
            </li>
          </ul>
        </nav>

        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>

        <button className="collapse-toggle" onClick={toggleSidebar}>
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <div className="admin-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;