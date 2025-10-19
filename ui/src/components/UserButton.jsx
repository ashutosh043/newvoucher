import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

export default function UserButton() {
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    localStorage.clear();

    Swal.fire({
      icon: 'success',
      title: 'Logged out successfully!',
      showConfirmButton: false,
      timer: 1500,
    });

    setTimeout(() => {
      navigate('/');
    }, 1600);
  };

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
        zIndex: 999,
      }}
    >
      <button
        onClick={handleLogout}
        style={{
          background: isMobile
            ? 'linear-gradient(135deg, #5c54ffff, #4167ffff)'
            : 'linear-gradient(135deg, #5c54ffff, #4167ffff)',
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
        onMouseEnter={(e) =>
          (e.target.style.transform = 'scale(1.05)')
        }
        onMouseLeave={(e) =>
          (e.target.style.transform = 'scale(1)')
        }
      >
        Logout
      </button>
    </div>
  );
}
