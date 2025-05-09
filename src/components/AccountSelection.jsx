import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import defaultAvatar from '../assets/profile-placeholder.png';
import '../css/AccountSelection.css';
import textLogo from '../assets/textLogo.png';
import logo from '../assets/CobconnectLogo.png';
import { FiUsers, FiUser, FiUserCheck, FiHome, FiBell, FiLogOut, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';

const AccountSelection = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, cobblers: 0, customers: 0 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const cobblersSnapshot = await getDocs(collection(db, 'cobblers'));
        const customersSnapshot = await getDocs(collection(db, 'customers'));

        const cobblersData = cobblersSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'cobbler',
          name: `${doc.data().fName || ''} ${doc.data().lName || ''}`.trim(),
          email: doc.data().email || '',
          avatar: doc.data().profileImg || '',
          ...doc.data()
        }));

        const customersData = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'customer',
          name: `${doc.data().fName || ''} ${doc.data().lName || ''}`.trim(),
          email: doc.data().email || '',
          avatar: doc.data().profileImg || '',
          ...doc.data()
        }));

        const allAccounts = [...cobblersData, ...customersData].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setAccounts(allAccounts);
        setFilteredAccounts(allAccounts);
        setStats({
          total: allAccounts.length,
          cobblers: cobblersData.length,
          customers: customersData.length
        });
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    let result = accounts;

    if (filter !== 'all') result = result.filter(account => account.type === filter);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        account =>
          account.name.toLowerCase().includes(term) ||
          account.email.toLowerCase().includes(term)
      );
    }

    setFilteredAccounts(result);
  }, [filter, accounts, searchTerm]);

  const handleAccountClick = (accountId, accountType) => {
    navigate(`/admin/user-profile/${accountType}/${accountId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="account-container">
     <div className="account-sidebar">
        <div className="logo-wrapper">
          <img src={logo} alt="Logo" className="logo-img" />
          <img src={textLogo} alt="cobconnect" className="logo-text-img" />
        </div>
        <nav>
          <ul>
            <li onClick={() => navigate('/dashboard')}>
              <FiHome className="nav-icon" /> Dashboard
            </li>
            <li onClick={() => navigate('/announcement')}>
              <FiBell className="nav-icon" /> Announcements
            </li>
            <li className="active" onClick={() => navigate('/accountselection')}>
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
        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            <FiUser className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      <div className="account-main-content">
        <h1 className="account-title">User Accounts</h1>
        <p className="account-subtitle">Manage all user accounts in one place</p>

        <div className="account-header-actions">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search accounts by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-section">
            <div className="filter-options">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Users
              </button>
              <button 
                className={`filter-btn ${filter === 'cobbler' ? 'active' : ''}`}
                onClick={() => setFilter('cobbler')}
              >
                Cobblers
              </button>
              <button 
                className={`filter-btn ${filter === 'customer' ? 'active' : ''}`}
                onClick={() => setFilter('customer')}
              >
                Customers
              </button>
            </div>
          </div>
        )}

        <div className="stats-container">
          <div className={`stat-card total ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            <div className="stat-icon"><FiUsers size={24} /></div>
            <div className="stat-info">
              <h3>Total Accounts</h3>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className={`stat-card cobblers ${filter === 'cobbler' ? 'active' : ''}`} onClick={() => setFilter('cobbler')}>
            <div className="stat-icon"><FiUserCheck size={24} /></div>
            <div className="stat-info">
              <h3>Total Cobblers</h3>
              <p>{stats.cobblers}</p>
            </div>
          </div>
          <div className={`stat-card customers ${filter === 'customer' ? 'active' : ''}`} onClick={() => setFilter('customer')}>
            <div className="stat-icon"><FiUser size={24} /></div>
            <div className="stat-info">
              <h3>Total Customers</h3>
              <p>{stats.customers}</p>
            </div>
          </div>
        </div>
        <div className="accounts-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="empty-state">
              <img src={defaultAvatar} alt="No accounts" className="empty-state-img" />
              <h3>No accounts found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="account-grid">
              {filteredAccounts.map(account => (
                <div
                  key={`${account.type}-${account.id}`}
                  className="account-card"
                  onClick={() => handleAccountClick(account.id, account.type)}
                >
                  <div className="account-avatar-container">
                    <img
                      src={account.avatar || defaultAvatar}
                      alt={account.name || 'User avatar'}
                      className="account-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <div className={`account-type-badge ${account.type}`}>
                      {account.type === 'cobbler' ? 'Cobbler' : 'Customer'}
                    </div>
                  </div>
                  <div className="account-details">
                    <h3 className="account-name">{account.name || 'No name provided'}</h3>
                    {account.email && (
                      <p className="account-email">{account.email}</p>
                    )}
                  </div>
                  <div className="account-arrow">
                    <FiChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSelection;