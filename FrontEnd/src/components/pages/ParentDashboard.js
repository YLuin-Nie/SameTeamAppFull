// File Name: ParentDashboard.js

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import '../Calendar.css';
import { getCurrentUser } from '../../utils/auth';
import {fetchChores, fetchCompletedChores, fetchUsers,
  fetchTeam, createTeam, joinTeam, addUserToTeam, removeUserFromTeam
} from '../../api/api';

function ParentDashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayAllTasks, setDisplayAllTasks] = useState(true);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [tasksForNext7Days, setTasksForNext7Days] = useState([]);
  const [children, setChildren] = useState([]);
  const [teamName, setTeamName] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showAddToTeamForm, setShowAddToTeamForm] = useState(false);

  const [createTeamName, setCreateTeamName] = useState('');
  const [createTeamPassword, setCreateTeamPassword] = useState('');
  const [joinTeamName, setJoinTeamName] = useState('');
  const [joinTeamPassword, setJoinTeamPassword] = useState('');
  const [email, setEmail] = useState('');

  const currentUser = getCurrentUser();

  const levels = [
    { level: 0, min: 0, max: 1, name: "Newbie", color: "#ccc" },
    { level: 1, min: 1, max: 200, name: "Beginner", color: "#cc9" },
    { level: 2, min: 200, max: 400, name: "Rising Star", color: "#aaf" },
    { level: 3, min: 400, max: 600, name: "Helper Pro", color: "#8f8" },
    { level: 4, min: 600, max: 1000, name: "Superstar", color: "#ffa" },
    { level: 5, min: 1000, max: 10000, name: "Legend", color: "#fc8" },
  ];

  const loadChoresAndUsers = async () => {
    try {
      const [users, allChores, allCompletedChores] = await Promise.all([
        fetchUsers(),
        fetchChores(),
        fetchCompletedChores()
      ]);
      const currentUserData = users.find(u => u.userId === currentUser.userId);

      if (currentUserData && currentUserData.teamId) {
        const team = await fetchTeam(currentUserData.teamId);
        setTeamName(team.teamName);
      }

      const childrenOnly = users.filter(u => u.role === 'Child' && u.teamId === currentUserData.teamId);
      const enhancedChildren = childrenOnly.map(child => {
        const childCompletedChores = allCompletedChores.filter(c => c.assignedTo === child.userId);
        const points = childCompletedChores.reduce((sum, c) => sum + c.points, 0);
        const level = levels.find(l => points < l.max) || levels[levels.length - 1];
        return { ...child, points, level };
      });

      setChildren(enhancedChildren);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d.toISOString().split('T')[0];
      });

      const childUserIds = enhancedChildren.map(child => child.userId);
      const upcomingChores = allChores.filter(c => {
        if (!c.dateAssigned || c.completed) return false;
        if (!childUserIds.includes(c.assignedTo)) return false;
        const date = new Date(c.dateAssigned).toISOString().split('T')[0];
        return next7Days.includes(date);
      }).sort((a, b) => new Date(a.dateAssigned) - new Date(b.dateAssigned));

      setTasksForNext7Days(upcomingChores);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  useEffect(() => {
    loadChoresAndUsers();
  }, [currentUser.userId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const newTeam = await createTeam(currentUser.userId, createTeamName, createTeamPassword);
      if (newTeam) {
        setTeamName(newTeam.teamName);
        alert('Team created successfully!');
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error("Create team error:", err);
      alert('Failed to create team.');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const joinedTeam = await joinTeam(currentUser.userId, joinTeamName, joinTeamPassword);
      alert('Joined team successfully!');
      setTeamName(joinedTeam.teamName);
      setJoinTeamName('');
      setJoinTeamPassword('');
      setShowJoinForm(false);
      await loadChoresAndUsers();
    } catch (err) {
      console.error("Join team error:", err);
      alert('Failed to join team.');
    }
  };

  const handleAddUserToTeam = async (e) => {
    e.preventDefault();
    try {
      const users = await fetchUsers();
      const currentUserData = users.find(u => u.userId === currentUser.userId);

      if (!currentUserData || !currentUserData.teamId) {
        alert('You must be part of a team to add users.');
        return;
      }

      await addUserToTeam(email, currentUserData.teamId);
      alert('User added to team successfully!');
      setEmail('');
      setShowAddToTeamForm(false);
      await loadChoresAndUsers();
    } catch (err) {
      console.error("Error adding user to team:", err);
      alert('Failed to add user to team.');
    }
  };

  const handleRemoveFromTeam = async (userId) => {
    if (window.confirm("Are you sure you want to remove this child from the team?")) {
      try {
        await removeUserFromTeam(userId);
        alert("Child removed from team.");
        await loadChoresAndUsers();
      } catch (err) {
        console.error("Error removing user:", err);
        alert("Failed to remove child from team.");
      }
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setDisplayAllTasks(false);

    try {
      const [users, allChores] = await Promise.all([fetchUsers(), fetchChores()]);
      const currentUserData = users.find(u => u.userId === currentUser.userId);
      const childrenOnly = users.filter(u => u.role === 'Child' && u.teamId === currentUserData.teamId);
      const childUserIds = childrenOnly.map(c => c.userId);

      const selectedDateStr = date.toISOString().split('T')[0];

      const filtered = allChores.filter(c => {
        if (!c.dateAssigned) return false;
        if (!childUserIds.includes(c.assignedTo)) return false;
        const d = new Date(c.dateAssigned).toISOString().split('T')[0];
        return d === selectedDateStr;
      });

      setTasksForSelectedDate(filtered.sort((a, b) => new Date(a.dateAssigned) - new Date(b.dateAssigned)));
    } catch (err) {
      console.error("Error filtering chores:", err);
    }
  };

  return (
    <div className="dashboard parent-dashboard">
      <h1>Parent Dashboard</h1>
      <p>Welcome, {currentUser?.username || "Parent"}!</p>

      <h3>Team: {teamName || "(None)"}</h3>

      <div className="team-actions">
        <button onClick={() => { setShowCreateForm(true); setShowJoinForm(false); setShowAddToTeamForm(false); }}>Create Team</button>
        <button onClick={() => { setShowJoinForm(true); setShowCreateForm(false); setShowAddToTeamForm(false); }}>Join Team</button>
        <button onClick={() => { setShowAddToTeamForm(true); setShowCreateForm(false); setShowJoinForm(false); }}>Add to Team</button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTeam}>
          <h4>Create Team</h4>
          <input type="text" placeholder="Team Name" value={createTeamName} onChange={(e) => setCreateTeamName(e.target.value)} required />
          <input type="password" placeholder="Team Password" value={createTeamPassword} onChange={(e) => setCreateTeamPassword(e.target.value)} required />
          <button type="submit">Create</button>
        </form>
      )}

      {showJoinForm && (
        <form onSubmit={handleJoinTeam}>
          <h4>Join Team</h4>
          <input type="text" placeholder="Team Name" value={joinTeamName} onChange={(e) => setJoinTeamName(e.target.value)} required />
          <input type="password" placeholder="Team Password" value={joinTeamPassword} onChange={(e) => setJoinTeamPassword(e.target.value)} required />
          <button type="submit">Join</button>
        </form>
      )}

      {showAddToTeamForm && (
        <form onSubmit={handleAddUserToTeam}>
          <h4>Add User to Team</h4>
          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Add to Team</button>
        </form>
      )}

      <h3>Children's Levels</h3>
      <ul>
        {children.map(child => (
            <li key={child.userId} className="level-badge-container">
              <span>{child.username} - </span>
              <span className="level-badge" style={{ backgroundColor: child.level.color }}>
                Level {child.level.level} - {child.level.name}
              </span>
              <span> ({child.points} pts)</span>
              <button onClick={() => handleRemoveFromTeam(child.userId)} >❌ Remove</button>
             
            </li>
          ))}
      </ul>

      <div className="calendar-tasks-container">
        <div className="calendar-section">
          <Calendar onChange={handleDateSelect} value={selectedDate} />
        </div>

        <div className="tasks-section">
          {displayAllTasks ? (
            <>
              <h3>Upcoming Chores (Next 7 Days)</h3>
              {tasksForNext7Days.length === 0 ? <p>No upcoming chores.</p> : (
                <ul>
                  {tasksForNext7Days.map(task => (
                    <li key={task.choreId}>
                      <strong>{task.choreText}</strong><br />
                      Due: {new Date(task.dateAssigned).toDateString()}<br />
                      Points: {task.points} pts
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <h3>Chores for {selectedDate ? selectedDate.toDateString() : ''}</h3>
              {tasksForSelectedDate.length === 0 ? <p>No chores for this date.</p> : (
                <ul>
                  {tasksForSelectedDate.map(task => (
                    <li key={task.choreId}>
                      {task.choreText}<br />
                      Due: {new Date(task.dateAssigned).toDateString()}<br />
                      Points: {task.points} pts
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
