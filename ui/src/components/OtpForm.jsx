import '../styles/components/OtpForm.css';

export default function OtpForm({ otpInput, onOtpChange, onVerifyOtp }) {
  return (
    <div className="otp-form">
      <input
        type="text"
        value={otpInput}
        onChange={onOtpChange}
        placeholder="Enter OTP"
      />
      <button onClick={onVerifyOtp}>Verify OTP</button>
    </div>
  );
}