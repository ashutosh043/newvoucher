import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../utils/api'; // ✅ use central API instance

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized Access',
        text: 'You are not authorized to access this page.',
      }).then(() => {
        navigate('/');
      });
    } else {
      fetchVouchers();
    }
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/voucher/all'); // ✅ using api.js
      if (res.data.success) {
        setVouchers(res.data.vouchers);
      } else {
        console.error('Unexpected response:', res.data);
      }
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Error',
        text: err.response?.data?.message || 'Error fetching vouchers',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'Logged out successfully.',
    }).then(() => {
      navigate('/');
      window.location.reload();
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Admin Dashboard</h2>
      <button onClick={() => navigate('/upload')}>Upload CSV</button>&nbsp;
      <button onClick={handleLogout}>Logout</button>
      <h3 style={{ marginTop: '30px' }}>All Vouchers</h3>
      <table border="1" style={{ margin: 'auto', marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>WiFi Type</th>
            <th>Status</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        
        <tbody>
          {vouchers.map((v, index) => (
            <tr key={index}>
              <td>{v.code}</td>
              <td>{v.wifiType}</td>
              <td>{v.isClaimed ? 'Claimed' : 'Unclaimed'}</td>
              <td>{v.assignedTo ? v.assignedTo.email : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}