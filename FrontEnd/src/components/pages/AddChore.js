// File Name: AddChore.js

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from "../../utils/auth";
import {
  fetchChores,
  postChore,
  fetchUsers,
  moveChoreToCompleted,
  deleteChore,
  fetchCompletedChores,
  completeChore,
  undoCompletedChore
} from "../../api/api";

const AddChore = () => {
  const [newChore, setNewChore] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [chorePoints, setChorePoints] = useState(10);
  const [choreDate, setChoreDate] = useState('');
  const [chores, setChores] = useState([]);
  const [completedChores, setCompletedChores] = useState([]);
  const [childUsers, setChildUsers] = useState([]);
  const [editingChoreId, setEditingChoreId] = useState(null);
  const [editedChore, setEditedChore] = useState({});

  useEffect(() => {
    loadChoresAndUsers();
  }, []);

  const loadChoresAndUsers = async () => {
    try {
      const users = await fetchUsers();
      const currentUser = getCurrentUser();
      const currentUserData = users.find(u => u.userId === currentUser.userId);

      const children = users.filter(user => user.role === "Child" && user.teamId === currentUserData.teamId);
      setChildUsers(children);

      const allChores = await fetchChores();
      const teamChildUserIds = children.map(child => child.userId);
      const choresFromBackend = allChores.filter(chore => teamChildUserIds.includes(chore.assignedTo));
      setChores(choresFromBackend);

      const completed = await fetchCompletedChores();
      const completedFiltered = completed.filter(chore => teamChildUserIds.includes(chore.assignedTo));
      setCompletedChores(completedFiltered);
    } catch (err) {
      console.error("Failed to load chores or users:", err);
    }
  };

  const addChore = async () => {
    if (newChore.trim() && assignedTo && choreDate) {
      const newChoreObj = {
        choreText: newChore,
        points: chorePoints,
        assignedTo: parseInt(assignedTo),
        dateAssigned: choreDate,
        completed: false,
      };

      try {
        const savedChore = await postChore(newChoreObj);
        setChores([...chores, savedChore]);
        setNewChore('');
        setChorePoints(10);
        setAssignedTo('');
        setChoreDate('');
      } catch (error) {
        console.error("Error adding chore:", error);
        alert("Could not add chore.");
      }
    }
  };

  const reloadChoresFiltered = async () => {
    const users = await fetchUsers();
    const currentUser = getCurrentUser();
    const currentUserData = users.find(u => u.userId === currentUser.userId);
    const children = users.filter(user => user.role === "Child" && user.teamId === currentUserData.teamId);
    const teamChildUserIds = children.map(child => child.userId);

    const updatedChores = await fetchChores();
    const filteredChores = updatedChores.filter(chore => teamChildUserIds.includes(chore.assignedTo));
    setChores(filteredChores);

    const updatedCompleted = await fetchCompletedChores();
    const filteredCompleted = updatedCompleted.filter(chore => teamChildUserIds.includes(chore.assignedTo));
    setCompletedChores(filteredCompleted);
  };

  const toggleCompletion = async (chore) => {
    if (!chore.completed) {
      try {
        await moveChoreToCompleted(chore.choreId);
        await reloadChoresFiltered();
      } catch (err) {
        console.error("Move chore to completed error:", err);
        alert("Failed to complete chore.");
      }
    }
  };

  const handleDelete = async (choreId) => {
    try {
      await deleteChore(choreId);
      setChores(chores.filter(c => c.choreId !== choreId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const startEdit = (chore) => {
    setEditingChoreId(chore.choreId);
    setEditedChore({
      choreText: chore.choreText,
      points: chore.points,
      dateAssigned: chore.dateAssigned.split('T')[0],
      assignedTo: chore.assignedTo
    });
  };

  const saveEdit = async (choreId) => {
    const updated = {
      choreId: choreId,
      choreText: editedChore.choreText,
      points: editedChore.points,
      dateAssigned: editedChore.dateAssigned,
      assignedTo: parseInt(editedChore.assignedTo),
      completed: false,
    };

    try {
      await completeChore(choreId, updated);
      setChores(chores.map(c => (c.choreId === choreId ? updated : c)));
      setEditingChoreId(null);
    } catch (err) {
      console.error("Error saving edited chore:", err);
      alert("Failed to save edits.");
    }
  };

  const handleUndoCompletion = async (completedId) => {
    try {
      await undoCompletedChore(completedId);
      await reloadChoresFiltered();
    } catch (err) {
      console.error("Undo complete error:", err);
      alert("Failed to undo completed chore.");
    }
  };

  return (
    <div>
      <h2>Chore Management</h2>
      <h3>Add a Chore</h3>

      <input type="text" value={newChore} onChange={e => setNewChore(e.target.value)} placeholder="Chore" />
      <input type="number" value={chorePoints} onChange={e => setChorePoints(Number(e.target.value))} placeholder="Points" />
      <input type="date" value={choreDate} onChange={e => setChoreDate(e.target.value)} />
      <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
        <option value="">Assign to...</option>
        {childUsers.map(child => (
          <option key={child.userId} value={child.userId}>{child.username}</option>
        ))}
      </select>
      <button onClick={addChore}>Add Chore</button>

      <h3>Pending Chores</h3>
      <ul>
        {chores.map(chore => {
          const assignedUser = childUsers.find(child => child.userId === chore.assignedTo);
          const assignedUsername = assignedUser ? assignedUser.username : "Unknown";

          return (
            <li key={chore.choreId} className="chore-list-item">
              {editingChoreId === chore.choreId ? (
                <>
                  <input type="text" value={editedChore.choreText} onChange={e => setEditedChore({ ...editedChore, choreText: e.target.value })} />
                  <input type="number" value={editedChore.points} onChange={e => setEditedChore({ ...editedChore, points: Number(e.target.value) })} />
                  <input type="date" value={editedChore.dateAssigned} onChange={e => setEditedChore({ ...editedChore, dateAssigned: e.target.value })} />
                  <select value={editedChore.assignedTo} onChange={e => setEditedChore({ ...editedChore, assignedTo: e.target.value })}>
                    {childUsers.map(child => (
                      <option key={child.userId} value={child.userId}>{child.username}</option>
                    ))}
                  </select>
                  <div className="chore-actions">
                    <button onClick={() => saveEdit(chore.choreId)} title="Save">💾</button>
                    <button onClick={() => setEditingChoreId(null)} title="Cancel">❌</button>
                  </div>
                </>
              ) : (
                <>
                  {chore.choreText} — {chore.points} pts — Assigned to: {assignedUsername}
                  <div className="chore-actions">
                    <button onClick={() => startEdit(chore)} title="Edit">✏️</button>
                    <button onClick={() => toggleCompletion(chore)} title="Complete">✔️</button>
                    <button onClick={() => handleDelete(chore.choreId)} title="Delete">🗑️</button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <h3>Completed Chores</h3>
      <ul>
        {completedChores.length === 0 ? (
          <p>No completed chores yet.</p>
        ) : (
          completedChores.map(chore => {
            const assignedUser = childUsers.find(child => child.userId === chore.assignedTo);
            const assignedUsername = assignedUser ? assignedUser.username : "Unknown";

            return (
              <li key={chore.completedId} className="chore-list-item">
                <span style={{ textDecoration: "line-through" }}>
                  {chore.choreText} — {chore.points} pts {assignedUsername !== "Unknown" ? `— Assigned to: ${assignedUsername}` : ""}
                </span>
                <div className="chore-actions">
                  <button onClick={() => handleUndoCompletion(chore.completedId)} title="Undo">↩️ Undo</button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default AddChore;
