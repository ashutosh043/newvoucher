import { BrowserRouter, Routes, Route } from "react-router-dom";
import WiFiSelectionPage from "./pages/WiFiSelectionPage";
import LoginPage from "./pages/LoginPage";
import ClaimVoucherPage from "./pages/ClaimVoucherPage";
import AdminDashboard from "./pages/AdminDashboard";
import CSVUploadPage from './pages/CSVUploadPage';
import AdminRoute from "./routes/AdminRoute";
import AdminButton from "./components/AdminButton";
import AdminLoginPage from "./pages/AdminLoginPage";  
import './App.css';
import { useEffect, useState } from 'react';
import Logo from "./components/Logo";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');
  }, []);

  return (
    <BrowserRouter>
      {isAdmin && <AdminButton />} 
      <div className="main">
       
      <Logo />
      <Routes>
        
        <Route path="/" element={<WiFiSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/claim" element={<ClaimVoucherPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />  
        <Route path="/upload" element={  
        <AdminRoute>
          <CSVUploadPage />
        </AdminRoute>
        }/>
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;