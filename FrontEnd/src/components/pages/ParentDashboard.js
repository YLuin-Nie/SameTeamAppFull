// File Name: ParentDashboard.js

import React, { useState, useEffect } from 'react';
import { getUsers, getCurrentUser, getChores, getUserLevelFromStorage } from "../utils/localStorageUtils";
import Calendar from 'react-calendar';
import '../Calendar.css'; 

function ParentDashboard() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [displayAllTasks, setDisplayAllTasks] = useState(true);
    const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
    const [tasksForNext7Days, setTasksForNext7Days] = useState([]);
    const [children, setChildren] = useState([]);

    const chores = getChores();
    const currentUser = getCurrentUser();

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const next7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            next7Days.push(date.toISOString().split('T')[0]);
        }

        const upcomingChores = chores.filter(chore => {
            if (!chore.date || chore.completed) return false;

            const choreDate = new Date(chore.date);
            choreDate.setHours(0, 0, 0, 0);

            if (isNaN(choreDate.getTime())) return false;

            return next7Days.includes(choreDate.toISOString().split('T')[0]);
        });

        // ✅ Sort chores by date in ascending order
        upcomingChores.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTasksForNext7Days(upcomingChores);
    }, [chores]);

    useEffect(() => {
        const childUsers = getUsers().filter(user => user.role === "Child");
        setChildren(childUsers.map(child => ({
            ...child,
            level: getUserLevelFromStorage(child.username)
        })));
    }, []);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setDisplayAllTasks(false);

        const selectedChores = chores.filter(chore => {
            if (!chore.date) return false;

            const choreDate = new Date(chore.date);
            choreDate.setHours(0, 0, 0, 0);

            return choreDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
        });

        // ✅ Sort selected chores by date in ascending order
        selectedChores.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTasksForSelectedDate(selectedChores);
    };

    return (
        <div className="dashboard parent-dashboard">
            <h1>Parent Dashboard</h1>
            <p>Welcome, {currentUser ? currentUser.username : "Parent"}! Manage your family's progress here.</p>

            <h3>Children's Levels</h3>
            <ul>
                {children.map(child => (
                    <li key={child.username} className="level-badge-container">
                        <span>{child.username} - </span>
                        <span className="level-badge" style={{ backgroundColor: child.level.color }}>
                            Level {child.level.level} - {child.level.name}
                        </span>
                        <span> ({child.points || 0} pts)</span>
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
                            {tasksForNext7Days.length === 0 ? (
                                <p>No upcoming chores.</p>
                            ) : (
                                <ul>
                                    {tasksForNext7Days.map(task => (
                                        <li key={task.id}>
                                            <span style={{ fontWeight: "bold" }}>{task.text}</span> 
                                            <br />
                                            Assigned to: <span style={{ color: "#FFD700" }}>{task.assignedTo}</span>
                                            <br />
                                            <small>Due: {new Date(task.date).toDateString()}</small>
                                        </li>
                                    ))}
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
                                    {tasksForSelectedDate.map(task => (
                                        <li key={task.id}>
                                            {task.text} - Assigned to: {task.assignedTo}
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
