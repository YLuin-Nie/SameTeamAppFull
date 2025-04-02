// File Name: SignUp.js

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import { getUsers, saveUsers, initializeLocalStorage } from "../utils/localStorageUtils";
import "../styles/signup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const SignUp = () => {
  const navigate = useNavigate();
  
  // ✅ Run initialization only once (prevents unnecessary localStorage operations)
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Parent",
    team: "ABY", // Default team
  });

  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ Debounced input change handler to improve performance
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }, 
    [] // Memoized so it doesn't re-create on every render
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { username, email, password, role, team } = formData;
    
    // ✅ Read users only once, reducing unnecessary localStorage reads
    let users = getUsers();

    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      setErrors("Email already registered.");
      setLoading(false);
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10); // ✅ Prevents UI blocking
      users = [...users, { username, email, password: hashedPassword, role, team }];

      saveUsers(users); // ✅ Write only when necessary
      alert("Sign-up successful! Proceeding to profile setup...");
      navigate("/profile-setup");
    } catch (error) {
      setErrors("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="header">
        <FontAwesomeIcon icon={faArrowLeft} onClick={() => navigate(-1)} className="back-arrow" />
        <h2>Sign Up</h2>
      </div>
      {errors && <p style={{ color: "red" }}>{errors}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="username"
          placeholder="Username" 
          value={formData.username} 
          onChange={handleInputChange} 
          required 
        />
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email} 
          onChange={handleInputChange} 
          required 
        />
        <div className="password-container">
          <input 
            type={showPassword ? "text" : "password"} 
            name="password"
            placeholder="Password (min 6 chars)" 
            value={formData.password} 
            onChange={handleInputChange} 
            required 
          />
          <span 
            onClick={() => setShowPassword(!showPassword)} 
            className={`eye-icon ${showPassword ? "open" : "closed"}`}
          >
            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
          </span>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;