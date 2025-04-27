// File Name: AddChore.js

import React, { useState, useEffect } from 'react';
import {
  fetchChores,
  postChore,
  fetchUsers,
  moveChoreToCompleted,
  deleteChore,
  fetchCompletedChores,
  completeChore // <- make sure to import this!
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
    const loadChoresAndUsers = async () => {
      try {
        const choresFromBackend = await fetchChores();
        setChores(choresFromBackend);
        const users = await fetchUsers();
        const children = users.filter(user => user.role === "Child");
        setChildUsers(children);

        const completed = await fetchCompletedChores();
        setCompletedChores(completed);
      } catch (err) {
        console.error("Failed to load chores or users:", err);
      }
    };
    loadChoresAndUsers();
  }, []);

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

  const toggleCompletion = async (chore) => {
    if (!chore.completed) {
      try {
        await moveChoreToCompleted(chore.choreId);
        setChores(chores.filter(c => c.choreId !== chore.choreId));
        const updatedCompleted = await fetchCompletedChores();
        setCompletedChores(updatedCompleted);
      } catch (err) {
        console.error("Move chore to completed error:", err);
        alert("Failed to complete chore.");
      }
    } else {
      console.warn("Undoing a completed chore is not supported yet.");
      alert("Undo is not supported yet.");
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
        {completedChores.map(chore => {
          const assignedUser = childUsers.find(child => child.userId === chore.assignedTo);
          const assignedUsername = assignedUser ? assignedUser.username : "Unknown";

          return (
            <li key={chore.completedId} className="chore-list-item">
              <span style={{ textDecoration: "line-through" }}>
                {chore.choreText} — {chore.points} pts — Assigned to: {assignedUsername}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AddChore;