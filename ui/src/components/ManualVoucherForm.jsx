import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function ManualVoucherForm() {
  const [voucherCode, setVoucherCode] = useState('');

  const handleAddVoucher = () => {
    if (!voucherCode) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Voucher Code',
        text: 'Please enter a voucher code.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Voucher Added',
      text: `Simulated Manual Voucher Add: ${voucherCode}`,
      confirmButtonColor: '#3085d6',
    });

    setVoucherCode('');
  };

  return (
    <div>
      <input
        type="text"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        placeholder="Enter Voucher Code"
      />
      <button onClick={handleAddVoucher}>Add Voucher</button>
    </div>
  );
}