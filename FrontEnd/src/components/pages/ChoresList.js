// File Name: ChoresList.js

import React, { useState, useEffect } from 'react';
import {
  fetchChores,
  fetchCompletedChores,
  moveChoreToCompleted,
  undoCompletedChore
} from '../../api/api';
import { getCurrentUser } from '../../utils/auth';

const ChoresList = () => {
  const [pendingChores, setPendingChores] = useState([]);
  const [completedChores, setCompletedChores] = useState([]);
  const [points, setPoints] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const currentUser = getCurrentUser();

  const loadChores = async () => {
    try {
      const [active, completed] = await Promise.all([
        fetchChores(),
        fetchCompletedChores()
      ]);

      const userPending = active.filter(c => c.assignedTo === currentUser.userId);
      const userCompleted = completed.filter(c => c.assignedTo === currentUser.userId);

      setPendingChores(userPending);
      setCompletedChores(userCompleted);

      const totalChores = userPending.length + userCompleted.length;
      setPoints(userCompleted.reduce((sum, c) => sum + c.points, 0));
      setCompletionPercentage(
        totalChores > 0 ? Math.round((userCompleted.length / totalChores) * 100) : 0
      );
    } catch (err) {
      console.error("Failed to load chores:", err);
    }
  };

  useEffect(() => {
    if (currentUser) loadChores();
  }, [currentUser.userId]);

  const handleComplete = async (choreId) => {
    try {
      await moveChoreToCompleted(choreId);
      await loadChores();
    } catch (err) {
      console.error("Failed to complete chore:", err);
      alert("Error completing chore.");
    }
  };

  const handleUndo = async (completedId) => {
    try {
      await undoCompletedChore(completedId);
      await loadChores();
    } catch (err) {
      console.error("Failed to undo chore:", err);
      alert("Error undoing chore.");
    }
  };

  return (
    <div className="chores-list-container">
      <h2>Your Chores</h2>
      <p><strong>Points:</strong> {points}</p>
      <p><strong>Task Completion:</strong> {completionPercentage}%</p>
      <progress value={completionPercentage} max="100"></progress>

      <h3>Pending Chores</h3>
      {pendingChores.length === 0 ? (
        <p>No pending chores.</p>
      ) : (
        <ul>
          {pendingChores.map(chore => (
            <li key={chore.choreId}>
              <strong>{chore.choreText}</strong> ({chore.points} pts)
              <br />
              <small>Due: {new Date(chore.dateAssigned).toDateString()}</small>
              <br />
              <button onClick={() => handleComplete(chore.choreId)}>✔️ Complete</button>
            </li>
          ))}
        </ul>
      )}

      <h3>Completed Chores</h3>
      {completedChores.length === 0 ? (
        <p>No completed chores.</p>
      ) : (
        <ul>
          {completedChores.map(chore => (
            <li key={chore.completedId} style={{ textDecoration: 'line-through' }}>
              <strong>{chore.choreText}</strong> ({chore.points} pts)
              <br />
              <small>Completed: {new Date(chore.dateAssigned).toDateString()}</small>
              <br />
              <button onClick={() => handleUndo(chore.completedId)}>↩️ Undo</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChoresList;
