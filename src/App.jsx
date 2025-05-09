import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Announcement from './components/Announcement';
import AccountSelection from './components/AccountSelection';
import AccountDetails from './components/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/announcement" element={<Announcement/>}/>
        <Route path="/accountselection" element={<AccountSelection/>}/>
        <Route path="/admin/user-profile/:type/:id" element={<AccountDetails />} />


      </Routes>
    </Router>
  );
}

export default App;