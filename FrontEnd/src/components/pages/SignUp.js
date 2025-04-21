import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import api from "../../api/api"; // Ensure this is correctly configured

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    team: "", // Default team
    teamPassword: "", // New field for team password
  });

  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTeamPassword, setShowTeamPassword] = useState(false); // State for team password visibility
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRoleSelection = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors("");

    console.log("Submitting form data:", formData);

    try {
      await api.post("/Auth/register", formData);
      alert("Sign-up successful! Please sign in to continue.");
      navigate("/signin");
    } catch (err) {
      console.error("Error during sign-up:", err);
      setErrors(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="header">
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={() => navigate(-1)}
          className="back-arrow"
        />
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

        <div>
          <p>Select Role:</p>
          <button
            type="button"
            className={`role-btn ${formData.role === 'Parent' ? 'selected' : ''}`}
            onClick={() => handleRoleSelection('Parent')}
          >
            Parent
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'Child' ? 'selected' : ''}`}
            onClick={() => handleRoleSelection('Child')}
          >
            Child
          </button>
        </div>

        {formData.role === 'Parent' && (
          <div>
            <label>
              Team Name:
              <input
                type="text"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                placeholder="Enter your team name"
              />
            </label>
            <div className="password-container">
              <label>
                Team Password:
                <input
                  type={showTeamPassword ? "text" : "password"}
                  name="teamPassword"
                  value={formData.teamPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your team password"
                />
              </label>
              <span
                onClick={() => setShowTeamPassword(!showTeamPassword)}
                className={`eye-icon ${showTeamPassword ? "open" : "closed"}`}
              >
                <FontAwesomeIcon icon={showTeamPassword ? faEye : faEyeSlash} />
              </span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
