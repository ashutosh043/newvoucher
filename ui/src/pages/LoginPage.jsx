import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEmails } from '../constants/adminEmails';
import Swal from 'sweetalert2';
import api from '../utils/api'; 

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [captchaGenerated, setCaptchaGenerated] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const selectedWiFi = localStorage.getItem('selectedWiFi');

  useEffect(() => {
    if (!selectedWiFi) {
      Swal.fire({
        icon: 'warning',
        title: 'WiFi Type Missing',
        text: 'Please select WiFi Type first',
      });
      navigate('/');
    }
    generateCaptcha();
  }, []);

  const logout = () => {
    localStorage.clear();
    api.post('/auth/logout', {}, { withCredentials: true });
    navigate('/');
  };

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaGenerated(code);
  };

  const isValidCollegeEmail = (email) => /^[a-zA-Z0-9._%+-]+@jimsindia\.org$/.test(email);

  const determineRoleFromEmail = (email) => {
    const studentCourses = ['bba', 'bca', 'mca', 'pgdm', 'baeco'];
    for (const course of studentCourses) {
      if (email.toLowerCase().includes(course)) return 'student';
    }
    return 'faculty';
  };

  const handleSendOtp = async () => {
    if (!email) {
      return Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your College ID',
      });
    }

    if (!isValidCollegeEmail(email)) {
      return Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Enter a valid Jims College Email.',
      });
    }

    if (captchaInput !== captchaGenerated) {
      generateCaptcha();
      return Swal.fire({
        icon: 'error',
        title: 'Captcha Failed',
        text: 'Incorrect Captcha. Please try again.',
      });
    }

    const derivedRole = determineRoleFromEmail(email);
    if (derivedRole !== selectedWiFi) {
      return Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: `You selected ${selectedWiFi} WiFi, but your email belongs to ${derivedRole}.`,
      });
    }


    try {
      const response = await api.post('/otp/send-otp', { email });
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent!',
          text: `OTP has been sent to ${email}`,
        });
        setOtpSent(true);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', derivedRole);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message,
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to send OTP',
      });
    }
  };

  const handleVerifyOtp = async () => {
    const role = localStorage.getItem('userRole');
    const storedEmail = localStorage.getItem('userEmail');
    try {
      const response = await api.post('/otp/verify-otp', {
        email: storedEmail,
        otp: otpInput.trim(),
        role,
      });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);

        if (
         adminEmails.includes(storedEmail.toLowerCase()) ||
          storedEmail.toLowerCase() === "anamika_jimsipu_bca23s2@jimsipu.org"
        ) {
           localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }

        Swal.fire({
          icon: 'success',
          title: 'OTP Verified!',
          text: 'You have successfully logged in.',
        }).then(() => {
          window.location.href = '/claim'; // Redirect after OK click
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: response.data.message,
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: 'OTP Verification failed',
      });
    }
  };

  const handleResendOtp = async () => {
    generateCaptcha();
    setCaptchaInput('');
    setOtpInput('');

    try {
      const response = await api.post('/otp/send-otp', { email });
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'OTP Resent!',
          text: `OTP has been resent to ${email}`,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message,
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to resend OTP',
      });
    }
  };

  return (
    <div className="main">
      <div className="card">
        <h2 className="heading">
          {selectedWiFi === 'student' ? 'Student Verification' : 'Faculty Verification'}
        </h2>
        <p className="intro">
          Enter your Jims College E-Mail ID provided by the college, that is your only valid mail
          to access the voucher online! Fill up reCAPTCHA, you will receive 6 digit One Time
          Password on your College mail ID. Thank You!
        </p>

        {!otpSent && (
          <>
            <input
              type="email"
              placeholder="Enter College ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <br />
            <br />

            <div>
              <strong
                style={{
                  fontSize: '18px',
                  border: '1px solid black',
                  borderRadius: '5px',
                  padding: '5px',
                }}
              >
                {captchaGenerated}
              </strong>
              <br />
              <input
                type="text"
                placeholder="Enter Captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                style={inputStyle}
              />
              <button className="button" onClick={generateCaptcha}>
                Refresh Captcha
              </button>
            </div>
            <br />
            <div className="button-group">
              <button onClick={handleSendOtp}>Send OTP</button>
            </div>
          </>
        )}

        {otpSent && (
          <>
            <h3>Enter OTP</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              style={inputStyle}
            />
            <br />
            <br />

            <div className="button-group">
              <button onClick={handleVerifyOtp}>Verify OTP</button>
              <button onClick={handleResendOtp}>Resend OTP</button>
            </div>
          </>
        )}
        <p className="info-note">Please wait few seconds after tapping on Button.</p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #ccc',
  width: '80%',
  maxWidth: '400px',
  fontSize: '16px',
  outline: 'none',
  marginTop: '20px',
  marginRight: '30px',
  fontFamily: 'Inter, sans-serif',
  marginBottom: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
};