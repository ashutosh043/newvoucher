import { useNavigate } from 'react-router-dom';
import '../styles/WifiSelectionPage.css';
import StepsGuide from '../components/StepGuide';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function WiFiSelectionPage() {
  const navigate = useNavigate();

  const handleWiFiSelection = (role) => {
    localStorage.setItem('selectedWiFi', role);
    navigate('/login');
  };

  return (
    <div className="page-container">
      
      {/* WiFi Selection Section */}
      <div className="wifi-selection-container">
        <div className="card">
          <h1 className="heading">Campus Wifi Voucher</h1>
          <p className="intro">
            Welcome to the official Campus WiFi Voucher Portal. Whether you're a student or faculty member, our secure platform helps you generate time-based internet vouchers seamlessly.
          </p>

          <div className="button-group">
            <button onClick={() => handleWiFiSelection('student')}><FaArrowLeft size={14} /> Student WiFi Access</button>
            <button onClick={() => handleWiFiSelection('faculty')}>Faculty WiFi Access <FaArrowRight size={14} /></button>
          </div>

          <p className="info-note">
            Have an issue? Contact <span onClick={() => navigate('/admin-login')} className="admin-link">here</span>.
          </p>
        </div>
      </div>

      {/* Steps Guide Section */}
      <div className="steps-section">
        <StepsGuide />
      </div>

    </div>
  );
}