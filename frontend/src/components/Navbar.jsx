import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, BarChart3, LogIn, LogOut, User, Sparkles } from 'lucide-react';

export const Navbar = ({ user, onLogout, activeDatasetName }) => {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              padding: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              borderRadius: '12px',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSpreadsheet size={24} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
              }}
              className="gradient-text"
            >
              Excel Analytics Pro
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontWeight: '600',
              }}
            >
              MERN Data Intelligence
            </div>
          </div>
        </Link>

        {/* Active Dataset Indicator Badge */}
        {activeDatasetName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#a5b4fc',
              fontWeight: '500',
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span>Active Dataset:</span>
            <strong style={{ color: '#ffffff' }}>{activeDatasetName}</strong>
          </div>
        )}

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#f9fafb',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <BarChart3 size={16} color="#818cf8" />
            <span>Dashboard</span>
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: '#e5e7eb',
                }}
              >
                <User size={14} color="#60a5fa" />
                <span>{user.username || user.email || 'User'}</span>
              </div>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '10px',
                  color: '#fda4af',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)')}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
