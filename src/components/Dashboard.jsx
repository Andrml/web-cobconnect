import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { FiTrendingUp, FiHome, FiBell, FiUsers, FiLogOut } from 'react-icons/fi';
import { BsPersonFill, BsPersonCheckFill, BsWallet2 } from 'react-icons/bs';
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState('totalAccounts');
  const [activePeriod, setActivePeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [cobblersCount, setCobblersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const comissionRate = 0.05;
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
          const totalAmount = fee / comissionRate;

          return {
            id: doc.id,
            timestamp: data.timestamp,
            date: new Date(data.timestamp).toLocaleString(),
            fee: fee,
            amount: totalAmount,
            status: totalAmount > 0 ? "success" : "cancelled",
          };
        })
      );

      // 🧾 Sort transactions by timestamp (newest → oldest)
      const sortedTransactions = fetchedTransactions.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setTransactions(sortedTransactions);
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

        <div className="wallet-balance-container">
          <div className="wallet-card">
            <div className="card-header">
              <h2>Transaction History</h2>
              <span className="commission-rate">{comissionRate * 100}% Commission</span>
            </div>
            
            <div className="transaction-list">
              {isLoading ? (
                <div className="empty-state">Loading transactions...</div>
              ) : transactions.length > 0 ? (
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
        </div>
        
        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} cobconnect.com. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;