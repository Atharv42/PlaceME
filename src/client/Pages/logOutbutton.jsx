import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

   
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} style={styles.button}>
      Logout
    </button>
  );
};

const styles = {
  button: {
    padding: '10px 16px',
    backgroundColor: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '12px',
  }
};

export default LogoutButton;
