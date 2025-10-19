import '../style/components/EmailForm.css';

export default function EmailForm({ email, rollNumber, onEmailChange, onRollNumberChange, onSendOtp, showRollNumberField }) {
  return (
    <div className="email-form">
      <input
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="Enter your College Email"
      />
      {showRollNumberField && (
        <input
          type="text"
          value={rollNumber}
          onChange={onRollNumberChange}
          placeholder="Enter your Roll Number"
        />
      )}
      <button onClick={onSendOtp}>Send OTP</button>
    </div>
  );
}