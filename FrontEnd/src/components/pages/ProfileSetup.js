import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from "../utils/localStorageUtils";
import ParentDashboard from './ParentDashboard';
import ChildDashboard from './ChildDashboard';
import "../styles/signup.css";

// Function to retrieve team name from localStorage
const getTeamName = () => localStorage.getItem("teamName") || "";

function ProfileSetup() {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [teamName, setTeamName] = useState(getTeamName());
    const [profileComplete, setProfileComplete] = useState(false);
    const currentUser = getCurrentUser();

    // Function to handle role selection
    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);
    };

    // Function to update team name
    const handleTeamNameChange = (e) => {
        setTeamName(e.target.value);
    };

    // Function to handle profile setup submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (role === 'parent' && teamName) {
            setProfileComplete(true);
        } else if (role === 'child') {
            setProfileComplete(true);
        } else {
            alert('Please select a role and provide a team name if you are a parent.');
        }
    };

    // Redirect user to the correct dashboard after profile setup
    if (profileComplete) {
        return role === 'parent' ? <ParentDashboard /> : <ChildDashboard />;
    }

    return (
        <div>
            <div className="header">
                <h2> Profile Setup</h2>
            </div>
            <p>Welcome, {currentUser ? currentUser.username : 'User'}!</p>
            <form onSubmit={handleSubmit}>
                {/* Role Selection Buttons */}
                <div>
                    <p>Select Role:</p>
                    <button
                        type="button"
                        className={`role-btn ${role === 'parent' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelection('parent')}
                    >
                        Parent
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === 'child' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelection('child')}
                    >
                        Child
                    </button>
                </div>

                {/* Input for Team Name (Only for Parents) */}
                {role === 'parent' && (
                    <div>
                        <label>
                            Team Name:
                            <input
                                type="text"
                                value={teamName}
                                onChange={handleTeamNameChange}
                                placeholder="Enter your team name"
                            />
                        </label>
                    </div>
                )}
                
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default ProfileSetup;