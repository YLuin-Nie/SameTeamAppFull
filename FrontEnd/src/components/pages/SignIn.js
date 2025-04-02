// File Name: SignIn.js

import React, { useState } from "react";
import { authenticateUser } from "../utils/localStorageUtils"; // Ensure correct import path
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const SignIn = ({ onSignInSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" }); // State for login form inputs
  const [error, setError] = useState(""); // State to track login errors
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const navigate = useNavigate();

  // Handle Login Form Submission
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Ensure email is a string before calling authentication
    if (typeof formData.email !== "string") {
      setError("Invalid email format.");
      console.error("Invalid email type:", formData.email);
      return;
    }

    // Trim email to remove accidental spaces
    const trimmedEmail = formData.email.trim();
    console.log("Attempting to log in with:", trimmedEmail);

    // Validate email input
    if (!trimmedEmail || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    // Authenticate user
    const user = authenticateUser(trimmedEmail, formData.password);

    if (!user) {
      setError("Invalid email or password."); // Show error if authentication fails
      console.log("Authentication failed for:", trimmedEmail);
      return;
    }

    console.log("User authenticated:", user);

    // Store authenticated user in localStorage
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // Ensure we pass email and password correctly
    if (onSignInSuccess) {
      onSignInSuccess(trimmedEmail, formData.password); // FIXED: Passing email & password correctly
    } else {
      console.error("onSignInSuccess function is not provided");
    }
  };

  return (
    <div className="signup-container">
      <div className="header">
        <FontAwesomeIcon icon={faArrowLeft} onClick={() => navigate(-1)} className="back-arrow" />
        <h2>Sign In</h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error if login fails */}
      <form onSubmit={handleLogin}>
        {/* Email Input */}
        <input 
          type="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })} 
          required 
        />
        {/* Password Input */}
        <div className="password-container">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            required 
          />
          <span 
            onClick={() => setShowPassword(!showPassword)} 
            className={`eye-icon ${showPassword ? 'open' : 'closed'}`}
          >
            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
          </span>
        </div>
        {/* Sign In Button */}
        <button type="submit" className="auth-button">Sign In</button>
      </form>
      {/* Sign Up Section Positioned Closer */}
      <div className="signup-section">
        <p>Don't have an account?</p>
        <button onClick={() => navigate("/signup")} className="auth-button">Sign Up</button>
      </div>
    </div>
  );
};

export default SignIn;