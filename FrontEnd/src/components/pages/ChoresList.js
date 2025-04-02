// File Name: ChoresList.js

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserPoints, updateUserPoints, getChores, saveChores } from "../utils/localStorageUtils";

const ChoresList = () => {
    const [chores, setChores] = useState({ pendingChores: [], completedChores: [] });
    const [points, setPoints] = useState(0);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const currentUser = getCurrentUser();

    useEffect(() => {
        if (currentUser) {
            const userPoints = getUserPoints(currentUser.username);
            setPoints(userPoints);

            const storedChores = getChores();
            const userChores = storedChores.filter(chore => chore.assignedTo === currentUser.username);

            // Get today's date and date 7 days ago
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);

            // Separate chores into pending and completed (only last 7 days)
            const pendingChores = userChores.filter(chore => !chore.completed);
            const completedChores = userChores.filter(chore => chore.completed && new Date(chore.date) >= sevenDaysAgo);

            setChores({ pendingChores, completedChores });

            // Calculate completion percentage
            if (userChores.length > 0) {
                const completedTasks = completedChores.length;
                setCompletionPercentage(Math.round((completedTasks / userChores.length) * 100));
            } else {
                setCompletionPercentage(0);
            }
        }
    }, [currentUser]);

    const completeChore = (choreId) => {
        const updatedChores = chores.pendingChores.map(chore => {
            if (chore.id === choreId) {
                const updatedChore = { ...chore, completed: true };

                const newPoints = points + (chore.points || 0);
                setPoints(newPoints);
                updateUserPoints(currentUser.username, newPoints);

                return updatedChore;
            }
            return chore;
        });

        const newCompletedChores = updatedChores.filter(chore => chore.completed);
        const newPendingChores = updatedChores.filter(chore => !chore.completed);

        setChores({ pendingChores: newPendingChores, completedChores: [...chores.completedChores, ...newCompletedChores] });
        saveChores([...newPendingChores, ...chores.completedChores, ...newCompletedChores]);

        // Recalculate completion percentage
        const totalTasks = newPendingChores.length + newCompletedChores.length;
        const completedTasks = newCompletedChores.length;
        setCompletionPercentage(Math.round((completedTasks / totalTasks) * 100));
    };

    return (
        <div className="chores-list-container">
            <h2>Your Chores</h2>
            <p><strong>Your Points:</strong> {points}</p>

            {/* ✅ Task Completion Progress Bar */}
            <p><strong>Task Completion Progress:</strong> {completionPercentage}%</p>
            <progress value={completionPercentage} max="100"></progress>

            {/* Pending Chores */}
            <h3>Pending Chores</h3>
            {chores.pendingChores.length === 0 ? (
                <p>No pending chores assigned.</p>
            ) : (
                <ul>
                    {chores.pendingChores.map(chore => (
                        <li key={chore.id}>
                            {chore.text} ({chore.points} pts)
                            <br />
                            <small>Due: {new Date(chore.date).toDateString()}</small>
                            <br />
                            <button onClick={() => completeChore(chore.id)}>✔️ Complete</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Completed Chores (Last 7 Days) */}
            <h3>Completed Chores (Last 7 Days)</h3>
            {chores.completedChores.length === 0 ? (
                <p>No completed chores in the last 7 days.</p>
            ) : (
                <ul>
                    {chores.completedChores.map(chore => (
                        <li key={chore.id} style={{ textDecoration: "line-through" }}>
                            {chore.text} ({chore.points} pts)
                            <br />
                            <small>Completed on: {new Date(chore.date).toDateString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChoresList;
