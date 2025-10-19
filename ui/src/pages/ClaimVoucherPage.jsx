// src/pages/ClaimVoucherPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserButton from '../components/UserButton';
import Swal from 'sweetalert2';
import api from '../utils/api'; 

export default function ClaimVoucherPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('userRole');
  const wifiType = localStorage.getItem('selectedWiFi');

  const [remainingVouchers, setRemainingVouchers] = useState(3);
  const [voucherDetails, setVoucherDetails] = useState(null);

  useEffect(() => {
    if (!email || !role || !wifiType) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Access',
        text: 'Please start from homepage.'
      }).then(() => {
        navigate('/');
      });
      return;
    }

    // Role Access Control
    if (role === 'student' && wifiType === 'faculty') {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'Students cannot claim Faculty WiFi Vouchers'
      }).then(() => {
        navigate('/');
      });
    } else {
      fetchRemainingVouchers();
    }
  }, []);

  const fetchRemainingVouchers = async () => {
    try {
      const res = await api.post('/user/get-user'); 
      if (res.data.success) {
        setRemainingVouchers(res.data.remainingVouchers);
      } else {
        console.error(res.data.message);
      }
    } catch (err) {
      console.error('Error fetching voucher count:', err);
    }
  };

  const handleClaimVoucher = async () => {
    if (remainingVouchers <= 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Vouchers Left',
        text: 'You have used all 3 vouchers. Try again after 3 months.',
      });
      return;
    }

    try {
      const res = await api.post('/user/assign', { wifiType }); 
      if (res.data.success) {
        setVoucherDetails(res.data.voucher);
        setRemainingVouchers(res.data.remainingVouchers);

        Swal.fire({
          icon: 'success',
          title: 'Voucher Claimed!',
          html: `<b>Code:</b> ${res.data.voucher.code} <br><small>Valid for 3 months</small>`
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.data.message,
        });
      }
    } catch (err) {
      console.error('Error claiming voucher:', err);
    }
  };

  return (
    <div className="main">
      <div className="card cardClaim">
        <UserButton />

        <h2 className="heading">
          Claim your {wifiType === 'student' ? 'Student' : 'Faculty'} WiFi Voucher
        </h2>
        <p className="intro">
          *You have a total of 3 voucher availability, claiming a voucher will lead to deduction in the number 
          of voucher you can claim till next 3 months. Duration of 1 voucher is for 3 months, after which it 
          will increase back the voucher count that you can have. Thank You!
        </p>

        <div className="button-group">
          <button onClick={handleClaimVoucher}>Claim Voucher</button>
        </div>

        {voucherDetails && (
          <div className="voucher-details" style={{ marginTop: '20px'}}>
            <p className='ch'><b>Voucher Code:</b> <strong>{voucherDetails.code}</strong></p>
            <p className='ch'>(Valid for 3 Months only)</p>
          </div>
        )}
        <p><strong>Remaining Vouchers:</strong> {remainingVouchers}</p>
      </div>
    </div>
  );
}