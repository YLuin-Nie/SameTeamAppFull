// File Name: ChildDashboard.js

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import '../Calendar.css';
import { getCurrentUser } from '../../utils/auth';
import { fetchChores, fetchCompletedChores, fetchUsers, fetchTeam } from '../../api/api';

function ChildDashboard() {
  const [userInfo, setUserInfo] = useState({});
  const [teamName, setTeamName] = useState('');
  const [points, setPoints] = useState(0);
  const [levelInfo, setLevelInfo] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [choresForDate, setChoresForDate] = useState([]);
  const [upcomingChores, setUpcomingChores] = useState([]);

  const currentUser = getCurrentUser();

  const levels = [
    { level: 0, min: 0, max: 1, name: "Newbie", color: "#ccc" },
    { level: 1, min: 1, max: 200, name: "Beginner", color: "#cc9" },
    { level: 2, min: 200, max: 400, name: "Rising Star", color: "#aaf" },
    { level: 3, min: 400, max: 600, name: "Helper Pro", color: "#8f8" },
    { level: 4, min: 600, max: 1000, name: "Superstar", color: "#ffa" },
    { level: 5, min: 1000, max: 10000, name: "Legend", color: "#fc8" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, chores, completedChores] = await Promise.all([
          fetchUsers(),
          fetchChores(),
          fetchCompletedChores()
        ]);

        const user = users.find(u => u.userId === currentUser.userId);
        setUserInfo(user);

        if (user?.teamId) {
          const team = await fetchTeam(user.teamId);
          setTeamName(team.teamName);
        }

        const userCompleted = completedChores.filter(c => c.assignedTo === currentUser.userId);
        const userPoints = userCompleted.reduce((sum, c) => sum + c.points, 0);
        setPoints(userPoints);

        const currentLevel = levels.find(l => userPoints < l.max) || levels[levels.length - 1];
        setLevelInfo(currentLevel);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          return d.toISOString().split('T')[0];
        });

        const upcoming = chores.filter(c => {
          if (!c.dateAssigned || c.completed) return false;
          const date = new Date(c.dateAssigned).toISOString().split('T')[0];
          return c.assignedTo === currentUser.userId && next7Days.includes(date);
        });

        setUpcomingChores(upcoming.sort((a, b) => new Date(a.dateAssigned) - new Date(b.dateAssigned)));

      } catch (err) {
        console.error("Error loading child dashboard:", err);
      }
    };

    loadData();
  }, [currentUser.userId]);

  const handleDateSelect = async (date) => {
    setSelectedDate(date);

    try {
      const chores = await fetchChores();
      const selectedStr = date.toISOString().split('T')[0];
      const filtered = chores.filter(c => {
        if (!c.dateAssigned || c.assignedTo !== currentUser.userId) return false;
        return new Date(c.dateAssigned).toISOString().split('T')[0] === selectedStr;
      });
      setChoresForDate(filtered);
    } catch (err) {
      console.error("Failed to filter chores by date:", err);
    }
  };

  return (
    <div className="dashboard child-dashboard">
      <h1>Child Dashboard</h1>
      <p>Welcome, {userInfo.username || "Child"}!</p>
      <h3>Team: {teamName || "(None)"}</h3>
      <div>
        <strong>Level:</strong>{' '}
        <span style={{ color: levelInfo.color, fontWeight: 'bold' }}>
          {levelInfo.name} (Level {levelInfo.level})
        </span>
        <br />
        <strong>Points:</strong> {points}
      </div>

      <div className="calendar-tasks-container">
        <div className="calendar-section">
          <Calendar onChange={handleDateSelect} value={selectedDate} />
        </div>

        <div className="tasks-section">
          {selectedDate ? (
            <>
              <h3>Chores for {selectedDate.toDateString()}</h3>
              {choresForDate.length === 0 ? <p>No chores assigned on this day.</p> : (
                <ul>
                  {choresForDate.map(task => (
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
              <h3>Upcoming Chores (Next 7 Days)</h3>
              {upcomingChores.length === 0 ? <p>No upcoming chores.</p> : (
                <ul>
                  {upcomingChores.map(task => (
                    <li key={task.choreId}>
                      <strong>{task.choreText}</strong><br />
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

export default ChildDashboard;
