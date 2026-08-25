import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasswordModal from './PasswordModal';
import { LogOut, Key, Store } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', bg: '#fee2e2', color: '#991b1b' };
      case 'STORE_OWNER':
        return { label: 'Store Owner', bg: '#fef3c7', color: '#92400e' };
      case 'NORMAL':
      default:
        return { label: 'User', bg: '#e0e7ff', color: '#3730a3' };
    }
  };

  const badge = getRoleBadge(user?.role);
  const passwordEndpoint = user?.role === 'STORE_OWNER' ? '/owner/password' : '/user/password';

  return (
    <>
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={26} color="#4f46e5" />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
            StoreRating
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              {user?.name}
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: badge.bg,
              color: badge.color
            }}>
              {badge.label}
            </span>
          </div>

          {user?.role !== 'ADMIN' && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f9fafb',
                color: '#374151',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Key size={14} />
              Password
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        apiEndpoint={passwordEndpoint}
      />
    </>
  );
};

export default Navbar;
