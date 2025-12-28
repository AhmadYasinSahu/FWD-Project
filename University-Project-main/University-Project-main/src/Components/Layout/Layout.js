import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Nav, NavDropdown, Button } from 'react-bootstrap';
import { FaUser, FaSignOutAlt, FaHome, FaFlask, FaFileAlt, FaBars, FaTimes, FaCaretUp } from 'react-icons/fa';
import defaultAvatar from '../../Assets/profilepic.png';
import airlogo from '../../Assets/airlogo.png';
import './Layout.css';

const Layout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(false);
    navigate('/profile');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Global route-change loader (fires on path changes)
  useEffect(() => {
    setIsRouteLoading(true);
    const t = setTimeout(() => setIsRouteLoading(false), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="layout">
      {isRouteLoading && (
        <div className="full-screen-loader" role="status" aria-live="polite">
          <div className="loader-side left"><span></span><span></span><span></span></div>
          <img src={airlogo} alt="Air University" className="loader-logo" />
          <div className="loader-side right"><span></span><span></span><span></span></div>
        </div>
      )}
      {/* Top Header */}
      <div className="top-header">
        <div className="header-left">
          
          {!sidebarOpen && (
            <button className="menu-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
          )}
          <div className="logo-section">
            <img src={airlogo} alt="Air University" className="logo-image" />
            <span className="logo-text">Air GPMS</span>
          </div>
        </div>
       
        <div className="header-right">
        <div className="header-center">
          <span className="greeting">Hi, {user?.name || 'User'}</span>
        </div>
          <div className="profile-dropdown-container" ref={profileDropdownRef}>
            <div className="user-icon-container" onClick={toggleProfileDropdown}>
              <img src={user?.avatarUrl || defaultAvatar} alt="User" className="user-avatar" />
              <FaCaretUp className={`dropdown-arrow ${profileDropdownOpen ? 'open' : ''}`} />
            </div>
            
            {profileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <img src={user?.avatarUrl || defaultAvatar} alt="User" className="profile-avatar-img" />
                  <div className="profile-info">
                    <div className="profile-name">{user?.name || 'User Name'}</div>
                    <div className="profile-email">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
                <div className="profile-menu">
                  <div className="menu-item" onClick={handleProfileClick}>
                    <FaUser className="menu-icon" />
                    <div className="menu-text">
                      <div className="menu-title">My Profile</div>
                      <div className="menu-subtitle">Account settings and more</div>
                    </div>
                  </div>
                  <div className="menu-item logout-item" onClick={handleLogout}>
                    <FaSignOutAlt className="menu-icon logout-icon" />
                    <div className="menu-text">
                      <div className="menu-title logout-text">Logout</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* Left Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          {/* Close button for sidebar */}
          {sidebarOpen && (
            <button className="sidebar-close-btn" onClick={toggleSidebar}>
              <FaTimes />
            </button>
          )}
          <Nav className="flex-column sidebar-nav">
            <Nav.Link as={Link} to="/dashboard" className="nav-item">
              <FaHome className="nav-icon" />
              <span>Dashboard</span>
            </Nav.Link>
            
            <Nav.Link as={Link} to="/profile" className="nav-item">
              <FaUser className="nav-icon" />
              <span>My Profile</span>
            </Nav.Link>
            
            <div className="nav-item research-dev-item">
              <FaFlask className="nav-icon" />
              <span>Research & Dev.</span>
              <FaFileAlt className="dropdown-arrow" />
            </div>
                         <Link to="/research-grants" className="dropdown-item research-grant-item">
               <div className="radio-option">
                 <input type="radio" name="research-option" id="grant-app" />
                 <label htmlFor="grant-app">Research Grant Application</label>
               </div>
             </Link>
          </Nav>
        </div>

        {/* Main Content */}
        <div className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <Outlet />
        </div>
      </div>

     
    </div>
  );
};

export default Layout; 