import React from 'react';
import ManualVoucherForm from '../components/ManualVoucherForm';
import '../styles/components/ManualAddVoucherPage.css';

export default function ManualAddVoucherPage() {
  return (
    <div className="manual-add-voucher-page">
      <h2>Add Voucher Manually</h2>
      <ManualVoucherForm />
    </div>
  );
}