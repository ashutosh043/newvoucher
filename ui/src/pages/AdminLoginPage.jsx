import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // If backend login implemented
import Swal from 'sweetalert2';
import '../styles/WifiSelectionPage.css'

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminLogin = async () => {
    if (email === 'adminJIMS2025@gmail.com' && password === 'jims2025') {
      localStorage.setItem('isAdmin', 'true');
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Admin Logged In Successfully',
      }).then(() => {
        navigate('/upload');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid Admin Credentials',
      });
    }
  };

  return (
    <div className="main">
      <div className="card">
        <h2 className="heading">Admin Login</h2>
        <p className="intro">Please enter your admin credentials to proceed.</p>
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdminLogin();
          }}
        >
          <input
            type="email"
            placeholder="Admin Email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          /><br /><br />
          <input
            type="password"
            placeholder="Admin Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          /><br /><br />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

// Add same styling as used in the form fields of wifi page
const inputStyle = {
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid #ccc',
  fontSize: '16px',
  width: '100%',
  maxWidth: '400px',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
};