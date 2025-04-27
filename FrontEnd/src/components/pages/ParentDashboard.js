// File Name: ParentDashboard.js

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import '../Calendar.css';
import { getCurrentUser } from '../../utils/auth';
import { fetchChores, fetchUsers, addChild, fetchTeam } from '../../api/api';

function ParentDashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayAllTasks, setDisplayAllTasks] = useState(true);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [tasksForNext7Days, setTasksForNext7Days] = useState([]);
  const [children, setChildren] = useState([]);
  const [childUsers, setChildUsers] = useState([]); // ✅ ADD THIS
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const currentUser = getCurrentUser();

  const levels = [
    { min: 0, max: 200, name: "Beginner", color: "#ccc" },
    { min: 200, max: 400, name: "Rising Star", color: "#aaf" },
    { min: 400, max: 600, name: "Helper Pro", color: "#8f8" },
    { min: 600, max: 1000, name: "Superstar", color: "#ffa" },
    { min: 1000, max: 10000, name: "Legend", color: "#fc8" },
  ];

  const loadChoresAndUsers = async () => {
    try {
      const [users, allChores] = await Promise.all([fetchUsers(), fetchChores()]);
      const currentUserData = users.find(u => u.userId === currentUser.userId);

      if (currentUserData && currentUserData.teamId) {
        const team = await fetchTeam(currentUserData.teamId);
        setTeamName(team.teamName);
      }

      const childrenOnly = users.filter(u => u.role === 'Child' && u.parentId === currentUser.userId);
      setChildUsers(childrenOnly); // ✅ SAVE THE CHILDREN!

      const enhancedChildren = childrenOnly.map(child => {
        const childChores = allChores.filter(c => c.assignedTo === child.userId && c.completed);
        const points = childChores.reduce((sum, c) => sum + c.points, 0);

        const level = levels.find(l => points < l.max) || levels[levels.length - 1];

        return {
          ...child,
          points,
          level
        };
      });

      setChildren(enhancedChildren);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d.toISOString().split('T')[0];
      });

      const upcomingChores = allChores.filter(c => {
        if (!c.dateAssigned || c.completed) return false;
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

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setDisplayAllTasks(false);

    try {
      const allChores = await fetchChores();
      const selectedDateStr = date.toISOString().split('T')[0];

      const filtered = allChores.filter(c => {
        if (!c.dateAssigned) return false;
        const d = new Date(c.dateAssigned).toISOString().split('T')[0];
        return d === selectedDateStr;
      });

      setTasksForSelectedDate(filtered.sort((a, b) => new Date(a.dateAssigned) - new Date(b.dateAssigned)));
    } catch (err) {
      console.error("Error loading chores:", err);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await addChild(childEmail, currentUser.userId);
      setChildEmail('');
      setShowAddChildForm(false);
      await loadChoresAndUsers();
    } catch (err) {
      console.error("Error adding child:", err);
      alert("Failed to add child. Please try again.");
    }
  };

  return (
    <div className="dashboard parent-dashboard">
      <h1>Parent Dashboard</h1>
      <p>Welcome, {currentUser?.username || "Parent"}! Manage your family's progress here.</p>

      <h3>Team: {teamName}</h3>

      <h3>Children's Levels</h3>
      <ul>
        {children.map(child => (
          <li key={child.userId} className="level-badge-container">
            <span>{child.username} - </span>
            <span className="level-badge" style={{ backgroundColor: child.level.color }}>
              Level {levels.indexOf(child.level) + 1} - {child.level.name}
            </span>
            <span> ({child.points} pts)</span>
          </li>
        ))}
      </ul>

      <button onClick={() => setShowAddChildForm(true)}>Add Child</button>

      {showAddChildForm && (
        <form onSubmit={handleAddChild}>
          <label>
            Child's Email:
            <input
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit">Add</button>
          <button type="button" onClick={() => setShowAddChildForm(false)}>Cancel</button>
        </form>
      )}

      <div className="calendar-tasks-container">
        <div className="calendar-section">
          <Calendar onChange={handleDateSelect} value={selectedDate} />
        </div>

        <div className="tasks-section">
          {displayAllTasks ? (
            <>
              <h3>Upcoming Chores (Next 7 Days)</h3>
              {tasksForNext7Days.length === 0 ? (
                <p>No upcoming chores.</p>
              ) : (
                <ul>
                  {tasksForNext7Days.map(task => {
                    const assignedUser = childUsers.find(child => child.userId === task.assignedTo);
                    const assignedUsername = assignedUser ? assignedUser.username : "Unknown";

                    return (
                      <li key={task.choreId}>
                        <strong>{task.choreText}</strong>
                        <br />
                        Assigned to: <span style={{ color: "#FFD700" }}>{assignedUsername}</span>
                        <br />
                        Due: {new Date(task.dateAssigned).toDateString()}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <>
              <h3>Chores for {selectedDate ? selectedDate.toDateString() : ''}</h3>
              {tasksForSelectedDate.length === 0 ? (
                <p>No chores for this date.</p>
              ) : (
                <ul>
                  {tasksForSelectedDate.map(task => {
                    const assignedUser = childUsers.find(child => child.userId === task.assignedTo);
                    const assignedUsername = assignedUser ? assignedUser.username : "Unknown";

                    return (
                      <li key={task.choreId}>
                        <strong>{task.choreText}</strong>
                        <br />
                        Assigned to: <span style={{ color: "#FFD700" }}>{assignedUsername}</span>
                        <br />
                        Due: {new Date(task.dateAssigned).toDateString()}
                      </li>
                    );
                  })
                }
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
