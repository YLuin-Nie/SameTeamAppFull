// File Name: ChildDashboard.js

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserPoints, getTotalPoints, getUserLevelFromStorage, getChores } from "../utils/localStorageUtils";
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import '../Calendar.css'; 

function ChildDashboard() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [displayAllTasks, setDisplayAllTasks] = useState(true);
    const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
    const [tasksForNext7Days, setTasksForNext7Days] = useState([]);
    const [points, setPoints] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [level, setLevel] = useState({});
    const [nextLevelThreshold, setNextLevelThreshold] = useState(0);
    const currentUser = getCurrentUser();
    const navigate = useNavigate();

    const chores = getChores();

    useEffect(() => {
        if (currentUser) {
            const userPoints = getUserPoints(currentUser.username);
            const totalEarned = getTotalPoints(currentUser.username);
            setPoints(userPoints);
            setTotalPoints(totalEarned);

            const currentLevel = getUserLevelFromStorage(currentUser.username);
            setLevel(currentLevel);

            // Determine next level threshold
            const levels = [
                { min: 0, max: 200 },
                { min: 200, max: 400 },
                { min: 400, max: 600 },
                { min: 600, max: 1000 },
                { min: 1000, max: 10000 },
            ];

            const nextLevel = levels.find(l => totalEarned < l.max);
            setNextLevelThreshold(nextLevel ? nextLevel.max : 1000);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const next7Days = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                next7Days.push(date.toISOString().split('T')[0]);
            }

            const upcomingChores = chores.filter(chore => {
                if (!chore.date || chore.completed || chore.assignedTo !== currentUser.username) return false;

                const choreDate = new Date(chore.date);
                choreDate.setHours(0, 0, 0, 0);

                if (isNaN(choreDate.getTime())) return false;

                return next7Days.includes(choreDate.toISOString().split('T')[0]);
            });

            //  Sort chores by date in ascending order
            upcomingChores.sort((a, b) => new Date(a.date) - new Date(b.date));

            setTasksForNext7Days(upcomingChores);
        }
    }, [chores, currentUser]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setDisplayAllTasks(false);

        const selectedChores = chores.filter(chore => {
            if (!chore.date || chore.assignedTo !== currentUser.username) return false;

            const choreDate = new Date(chore.date);
            choreDate.setHours(0, 0, 0, 0);

            return choreDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
        });

        //  Sort selected chores by date in ascending order
        selectedChores.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTasksForSelectedDate(selectedChores);
    };

    return (
        <div className="dashboard child-dashboard">
            <h1>Child Dashboard</h1>
            <p className="welcome-message">Welcome, {currentUser ? currentUser.username : "Child"}!</p>
            <p><strong>Total Points Earned:</strong> {totalPoints}</p>
            <p><strong>Unspent Points:</strong> {points}</p>

            {/* Level Display */}
            <div className="level-badge" style={{ backgroundColor: level.color }}>
                Level {level.level} - {level.name}
            </div>

            {/*  Progress to the next level */}
            <p>Next Level Progress: {totalPoints - (nextLevelThreshold - 200)} / 200</p>
            <progress value={totalPoints - (nextLevelThreshold - 200)} max="200"></progress>

            {/* Calendar and Tasks Section - Mirroring Parent Dashboard */}
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
                                            <small>Due: {new Date(task.date).toDateString()}</small>
                                            <br />
                                            <span>Points: {task.points} pts</span>
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
                                            {task.text}
                                            <br />
                                            <small>Due: {new Date(task.date).toDateString()}</small>
                                            <br />
                                            <span>Points: {task.points} pts</span>
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
