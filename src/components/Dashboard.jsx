import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FiTrendingUp, FiHome, FiBell, FiUsers, FiLogOut } from 'react-icons/fi';
import { BsPersonFill, BsPersonCheckFill, BsWallet2 } from 'react-icons/bs';
import textLogo from '../assets/textLogo.png';
import logo from '../assets/CobconnectLogo.png';
import '../css/Dashboard.css';

Chart.register(...registerables);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState('totalAccounts');
  const [activePeriod, setActivePeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [cobblersCount, setCobblersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
    
        const cobblersSnapshot = await getDocs(collection(db, "cobblers"));
        const customersSnapshot = await getDocs(collection(db, "customers"));
        setCobblersCount(cobblersSnapshot.size);
        setCustomersCount(customersSnapshot.size);
    
        const adminWalletRef = doc(db, "wallet", "AdminWallet");
        const adminWalletSnap = await getDoc(adminWalletRef);
        if (adminWalletSnap.exists()) {
          const data = adminWalletSnap.data();
          setWalletBalance(data.balance || 0);
        }
        
        const transactionHistoryRef = collection(db, "wallet", "AdminWallet", "transactionHistory");
        const transactionsSnapshot = await getDocs(transactionHistoryRef);
        const fetchedTransactions = await Promise.all(
          transactionsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const fee = data.addedBalance || 0;
            const totalAmount = fee / 0.10;
        
            return {
              date: new Date(data.timestamp).toLocaleString(),
              fee: fee,
              amount: totalAmount,
              status: "success",
            };
          })
        );
        setTransactions(fetchedTransactions);        
      
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };


  const timePeriodData = {
    totalAccounts: {
      day: { 
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],  
        data: Array(7).fill(0).map(() => cobblersCount - 5 + Math.floor(Math.random() * 10)) 
      },
  
      week: { 
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: Array(4).fill(0).map((_, i) => cobblersCount + customersCount - 150 + Math.floor(i * 30) + Math.floor(Math.random() * 30)) 
      },
      month: { 
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
        data: Array(12).fill(0).map((_, i) => Math.floor((cobblersCount + customersCount) * (0.7 + i * 0.1)) + Math.floor(Math.random() * 20)) 
      },
      year: { 
        labels: ['2023', '2024', '2025'],  
        data: Array(3).fill(0).map((_, i) => Math.floor((cobblersCount + customersCount) * (i / 12)) + Math.floor(Math.random() * 30)) 
      }
    },
    cobblers: {
      day: { 
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],  
        data: Array(7).fill(0).map(() => cobblersCount - 5 + Math.floor(Math.random() * 10)) 
      }
      ,
      week: { 
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
        data: Array(4).fill(0).map((_, i) => cobblersCount - 20 + Math.floor(i * 5) + Math.floor(Math.random() * 5)) 
      },
      month: { 
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
        data: Array(12).fill(0).map((_, i) => Math.floor(cobblersCount * (0.7 + i * 0.1)) + Math.floor(Math.random() * 5)) 
      },
      year: { 
        labels: ['2023', '2024', '2025'], 
        data: Array(3).fill(0).map((_, i) => Math.floor(cobblersCount * (i / 12)) + Math.floor(Math.random() * 5)) 
      }
    },
    customers: {
      day: { 
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],  
        data: Array(7).fill(0).map(() => cobblersCount - 5 + Math.floor(Math.random() * 10)) 
      }
      ,
      week: { 
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
        data: Array(4).fill(0).map((_, i) => customersCount - 150 + Math.floor(i * 30) + Math.floor(Math.random() * 30)) 
      },
      month: { 
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
        data: Array(12).fill(0).map((_, i) => Math.floor(customersCount * (0.7 + i * 0.1)) + Math.floor(Math.random() * 20)) 
      },
      year: { 
        labels:  ['2023', '2024', '2025'], 
        data: Array(3).fill(0).map((_, i) => Math.floor(customersCount * (i / 12)) + Math.floor(Math.random() * 30)) 
      }
    },
    wallet: {
      day: { 
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],  
        data: Array(7).fill(0).map(() => cobblersCount - 5 + Math.floor(Math.random() * 10)) 
      }
      ,
      week: { 
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
        data: Array(4).fill(0).map((_, i) => walletBalance - 1000 + Math.floor(i * 300) + Math.floor(Math.random() * 200)) 
      },
      month: { 
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
        data: Array(12).fill(0).map((_, i) => Math.floor(walletBalance * (0.6 + i * 0.15)) + Math.floor(Math.random() * 200)) 
      },
      year: { 
        labels: ['2023', '2024', '2025'], 
        data: Array(3).fill(0).map((_, i) => Math.floor(walletBalance * (i / 12)) + Math.floor(Math.random() * 500)) 
      }
    }
  };

  const currentData = timePeriodData[activeCard][activePeriod];

  const chartData = {
    labels: currentData.labels,
    datasets: [{
      label: getChartLabel(),
      data: currentData.data,
      borderColor: getBorderColor(),
      backgroundColor: getBackgroundColor(),
      tension: 0.3,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            return activeCard === 'wallet' ? label + formatCurrency(context.raw) : label + context.raw;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return activeCard === 'wallet' ? formatCurrency(value) : value;
          }
        }
      }
    }
  };

  function getChartLabel() {
    switch (activeCard) {
      case 'totalAccounts': return 'Total Accounts';
      case 'cobblers': return 'Total Cobblers';
      case 'customers': return 'Total Customers';
      case 'wallet': return 'Wallet Balance';
      default: return 'Data';
    }
  }

  function getBorderColor() {
    switch (activeCard) {
      case 'totalAccounts': return '#4f46e5';
      case 'cobblers': return '#f59e0b';
      case 'customers': return '#10b981';
      case 'wallet': return '#8b5cf6';
      default: return '#4f46e5';
    }
  }

  function getBackgroundColor() {
    switch (activeCard) {
      case 'totalAccounts': return 'rgba(79, 70, 229, 0.1)';
      case 'cobblers': return 'rgba(245, 158, 11, 0.1)';
      case 'customers': return 'rgba(16, 185, 129, 0.1)';
      case 'wallet': return 'rgba(139, 92, 246, 0.1)';
      default: return 'rgba(79, 70, 229, 0.1)';
    }
  }

  const handleCardClick = (cardType) => {
    setActiveCard(cardType);
  };

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
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
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="logo-wrapper">
          <img src={logo} alt="Logo" className="logo-img" />
          <img src={textLogo} alt="cobconnect" className="logo-text-img" />
        </div>
        <nav>
          <ul>
            <li className="active">
              <FiHome className="nav-icon" /> Dashboard
            </li>
            <li onClick={() => navigate('/announcement')}>
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

      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <h1>Welcome back, Admin!</h1>
        </header>
        
        <div className="stats-container">
          <div 
            className={`stat-card total ${activeCard === 'totalAccounts' ? 'active' : ''}`}
            onClick={() => handleCardClick('totalAccounts')}
          >
            <FiTrendingUp size={28} />
            <div className="stat-info">
              <span className="stat-label">Total Accounts</span>
              <span className="stat-value">{cobblersCount + customersCount}</span>
            </div>
          </div>
          <div 
            className={`stat-card cobblers ${activeCard === 'cobblers' ? 'active' : ''}`}
            onClick={() => handleCardClick('cobblers')}
          >
            <BsPersonFill size={28} />
            <div className="stat-info">
              <span className="stat-label">Total Cobblers</span>
              <span className="stat-value">{cobblersCount}</span>
            </div>
          </div>
          <div 
            className={`stat-card customers ${activeCard === 'customers' ? 'active' : ''}`}
            onClick={() => handleCardClick('customers')}
          >
            <BsPersonCheckFill size={28} />
            <div className="stat-info">
              <span className="stat-label">Total Customers</span>
              <span className="stat-value">{customersCount}</span>
            </div>
          </div>
          <div 
            className={`stat-card wallet ${activeCard === 'wallet' ? 'active' : ''}`}
            onClick={() => handleCardClick('wallet')}
          >
            <BsWallet2 size={28} />
            <div className="stat-info">
              <span className="stat-label">Wallet Balance</span>
              <span className="stat-value">{formatCurrency(walletBalance)}</span>
            </div>
          </div>
        </div>

        <div className="graph-container">
          <div className="graph-header">
            <div className="graph-title">Performance Overview</div>
            <div className="time-period-selector">
              <button className={`time-period-btn ${activePeriod === 'day' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('day')}> Day </button>
              <button className={`time-period-btn ${activePeriod === 'week' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('week')}> Week </button>
              <button className={`time-period-btn ${activePeriod === 'month' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('month')}> Month </button>
              <button className={`time-period-btn ${activePeriod === 'year' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('year')}> Year </button>
            </div>
          </div>
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="wallet-card">
          <div className="card-header">
            <h2>Transaction History</h2>
            <span className="commission-rate">10% Commission</span>
          </div>
          
          <div className="transaction-list">
            {transactions.length > 0 ? (
              transactions.map(txn => (
                <div key={txn.id} className={`transaction-item ${txn.status}`}>
                  <div className="transaction-info">
                    <div className="transaction-meta">
                      <span className="transaction-date">{txn.date}</span>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <div className="transaction-fee">
                    <span>+{formatCurrency(txn.fee)}</span>
                      <span className="status-badge">{txn.status}</span>
                    </div>
                    <div className="transaction-total">{formatCurrency(txn.amount)} total</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No transactions found</div>
            )}
          </div>
        </div>
        
        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} cobconnect.com. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;