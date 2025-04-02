import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/localStorageUtils';

const NavBar = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/'); // Redirect to home or sign-in page after logout
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {currentUser && currentUser.role === 'Parent' && (
          <>
            <li className="navbar-item">
              <Link to="/parent-dashboard" className="navbar-link">
                <i className="fas fa-tachometer-alt"></i> {/* Dashboard icon */}
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/add-chores" className="navbar-link">
                <i className="fas fa-tasks"></i> {/* Add Chores icon */}
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/parent-rewards" className="navbar-link">
                <i className="fas fa-gift"></i> {/* Add Reward icon */}
              </Link>
            </li>
          </>
        )}
        {currentUser && currentUser.role === 'Child' && (
          <>
            <li className="navbar-item">
              <Link to="/child-dashboard" className="navbar-link">
                <i className="fas fa-tachometer-alt"></i> {/* Dashboard icon */}
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/chores-list" className="navbar-link">
                <i className="fas fa-list"></i> {/* Your Chores icon */}
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/child-rewards" className="navbar-link">
                <i className="fas fa-gift"></i> {/* Child Rewards icon */}
              </Link>
            </li>

          </>
        )}
        {currentUser && (
          <li className="navbar-item">
            <Link to="/" onClick={handleLogout} className="navbar-link">
              <i className="fas fa-sign-out-alt"></i> {/* Logout icon */}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;