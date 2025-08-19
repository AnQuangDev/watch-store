import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">⌚</span>
            <span className="logo-text">WatchStore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/products" className="nav-link">Sản phẩm</Link>
          </nav>

          {/* Right Section */}
          <div className="header-actions">
            {/* Cart */}
            <Link to="/cart" className="cart-link">
              <span className="cart-icon">🛒</span>
              {totalQuantity > 0 && (
                <span className="cart-badge">{totalQuantity}</span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="user-menu">
                <span className="user-greeting">Xin chào, {user.name}</span>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">Hồ sơ</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link">Đăng nhập</Link>
                <Link to="/register" className="auth-link register">Đăng ký</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Sản phẩm
            </Link>
            <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Giỏ hàng {totalQuantity > 0 && `(${totalQuantity})`}
            </Link>
            
            {user ? (
              <>
                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Hồ sơ
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
