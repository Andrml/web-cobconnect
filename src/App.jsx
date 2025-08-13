import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import Announcement from './components/Announcement';
import AccountSelection from './components/AccountSelection';
import UserProfile from './components/UserProfile';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/accountselection" element={<AccountSelection />} />
          <Route path="/admin/user-profile/:type/:id" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;