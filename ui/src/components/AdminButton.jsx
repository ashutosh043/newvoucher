import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AdminButton() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  const handleLogin = () => {
    navigate('/admin-login');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'Logged out successfully!',
    }).then(() => {
      navigate('/');
      window.location.reload(); // refresh everything
    });
  };

  const handleGoToUpload = () => {
    navigate('/upload');
  };

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Responsive check
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '8px' : '15px',
        right: isMobile ? '8px' : '20px',
        zIndex: 1000, // 👈 ensures it's above UserButton (999)
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: isMobile ? '8px' : '15px',
      }}
    >
      {isAdmin ? (
        <>
          {/* Upload CSV Button */}
          <button
            onClick={handleGoToUpload}
            style={{
              background: 'linear-gradient(135deg, #5c54ffff, #4167ffff)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '8px 28px' : '10px 22px',
              borderRadius: '50px',
              fontSize: isMobile ? '10px' : '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            Upload CSV
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #5c54ffff, #4167ffff)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '8px 14px' : '10px 22px',
              borderRadius: '50px',
              fontSize: isMobile ? '12px' : '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            Logout
          </button>
        </>
      ) : (
        null
      )}
    </div>
  );
}
