// File Name: ParentRewards.js

import React, { useState, useEffect } from "react";
import { getUsers, saveUsers, getRedeemedRewards, storeRedeemedReward, addRewardAsCompletedChore, saveRewards, getRewards } from "../utils/localStorageUtils";

function ParentRewards() {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState("");
    
    // Separate state for rewarding a child
    const [rewardChildName, setRewardChildName] = useState("");
    const [rewardChildPoints, setRewardChildPoints] = useState(10);
    
    // Separate state for defining new rewards
    const [newRewardName, setNewRewardName] = useState("");
    const [newRewardPoints, setNewRewardPoints] = useState(10);
    
    const [redeemedRewards, setRedeemedRewards] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [editingReward, setEditingReward] = useState(null);
    const [editedRewardName, setEditedRewardName] = useState("");
    const [editedRewardCost, setEditedRewardCost] = useState(0);

    useEffect(() => {
        const users = getUsers();
        const childUsers = users.filter(user => user.role === "Child");
        setChildren(childUsers);

        // Load rewards and redeemed rewards
        setRewards(getRewards());
        setRedeemedRewards(getRedeemedRewards());
    }, []);

    const rewardChild = () => {
        if (!selectedChild || !rewardChildName || rewardChildPoints <= 0) {
            alert("Please select a child, enter a reward, and set a valid point amount.");
            return;
        }

        const users = getUsers();
        const updatedUsers = users.map(user => {
            if (user.username === selectedChild) {
                const newPoints = (user.points || 0) + rewardChildPoints;
                return { ...user, points: newPoints };
            }
            return user;
        });

        saveUsers(updatedUsers);

        // ✅ Store reward as a completed chore
        addRewardAsCompletedChore(selectedChild, rewardChildName, rewardChildPoints);

        alert(`Successfully rewarded ${rewardChildPoints} points to ${selectedChild} for ${rewardChildName}!`);
        
        setSelectedChild("");
        setRewardChildName("");
        setRewardChildPoints(10);
    };

    const addReward = () => {
        if (!newRewardName.trim() || newRewardPoints <= 0) {
            alert("Please enter a valid reward name and cost.");
            return;
        }

        const newReward = { id: Date.now(), name: newRewardName, cost: newRewardPoints };
        const updatedRewards = [...rewards, newReward];

        setRewards(updatedRewards);
        saveRewards(updatedRewards); // ✅ Store rewards in localStorage

        setNewRewardName("");
        setNewRewardPoints(10);
    };

    const deleteReward = (id) => {
        const updatedRewards = rewards.filter(reward => reward.id !== id);
        setRewards(updatedRewards);
        saveRewards(updatedRewards);
    };

    const startEdit = (reward) => {
        setEditingReward(reward.id);
        setEditedRewardName(reward.name);
        setEditedRewardCost(reward.cost);
    };

    const saveEdit = () => {
        const updatedRewards = rewards.map(reward => 
            reward.id === editingReward ? { ...reward, name: editedRewardName, cost: editedRewardCost } : reward
        );
        setRewards(updatedRewards);
        saveRewards(updatedRewards);
        setEditingReward(null);
        setEditedRewardName("");
        setEditedRewardCost(0);
    };

    return (
        <div className="rewards-container">
            <h2>Parent Rewards Management</h2>

            <h3>Reward A Child (Extra Points)</h3>
            <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
                <option value="">Select a child...</option>
                {children.map(child => (
                    <option key={child.username} value={child.username}>{child.username}</option>
                ))}
            </select>

            <label>Reward Name:</label>
            <input type="text" value={rewardChildName} onChange={(e) => setRewardChildName(e.target.value)} placeholder="Enter reward (e.g., Extra Playtime)" />

            <label>Points:</label>
            <input type="number" value={rewardChildPoints} onChange={(e) => setRewardChildPoints(Number(e.target.value))} min="1" />

            <button onClick={rewardChild}>Reward Points</button>

            <hr />

            <h3>Define New Rewards</h3>
            <input type="text" placeholder="Reward Name" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} />
            <input type="number" placeholder="Cost" value={newRewardPoints} onChange={(e) => setNewRewardPoints(Number(e.target.value))} />
            <button onClick={addReward}>Add Reward</button>

            <hr />

            <h3>Manage Rewards</h3>
            <ul className="reward-list">
                {rewards.length === 0 ? <p>No rewards defined yet.</p> :
                    rewards.map((reward) => (
                        <li key={reward.id} className="reward-item">
                            {editingReward === reward.id ? (
                                <>
                                    <input type="text" value={editedRewardName} onChange={(e) => setEditedRewardName(e.target.value)} />
                                    <input type="number" value={editedRewardCost} onChange={(e) => setEditedRewardCost(Number(e.target.value))} />
                                    <button title="Save Changes" onClick={saveEdit}>💾</button>
                                    <button title="Cancel Editing" onClick={() => setEditingReward(null)}>❌</button>
                                </>
                            ) : (
                                <>
                                    <span>{reward.name} - {reward.cost} Points</span>
                                    <div className="reward-actions">
                                        <button title="Edit Reward" onClick={() => startEdit(reward)}>✏️</button>
                                        <button title="Delete Reward" onClick={() => deleteReward(reward.id)}>🗑️</button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))
                }
            </ul>

            <hr />

            <h3>Redeemed Rewards History</h3>
            {redeemedRewards.length === 0 ? (
                <p>No rewards redeemed yet.</p>
            ) : (
                <ul className="redeemed-reward-list">
                    {redeemedRewards.map(reward => (
                        <li key={reward.id}>
                            {reward.username} redeemed "{reward.rewardName}" for {reward.pointsSpent} points on {new Date(reward.date).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ParentRewards;
