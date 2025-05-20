// File Name: ParentRewards.js

import React, { useState, useEffect } from "react";
import {fetchUsers, fetchRewards, postReward, updateReward,
  deleteReward as deleteRewardAPI, rewardAsChore,fetchRedeemedRewards
} from "../../api/api";
import { getCurrentUser } from "../../utils/auth";

function ParentRewards() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [rewardChildName, setRewardChildName] = useState("");
  const [rewardChildPoints, setRewardChildPoints] = useState(10);

  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState(10);

  const [rewards, setRewards] = useState([]);
  const [editingReward, setEditingReward] = useState(null);
  const [editedRewardName, setEditedRewardName] = useState("");
  const [editedRewardCost, setEditedRewardCost] = useState(0);

  const [redeemedRewards, setRedeemedRewards] = useState({}); 

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await fetchUsers();
        const currentUser = getCurrentUser();
        const currentUserData = users.find(u => u.userId === currentUser.userId);

        const teamChildren = users.filter(u => u.role === "Child" && u.teamId === currentUserData.teamId);
        setChildren(teamChildren);

        const rewardsData = await fetchRewards();
        setRewards(rewardsData);

        // Fetch redeemed rewards for each child
        const redemptionMap = {};
        for (const child of teamChildren) {
          const redemptions = await fetchRedeemedRewards(child.userId);
          redemptionMap[child.username] = redemptions;
        }
        setRedeemedRewards(redemptionMap);

      } catch (err) {
        console.error("Error loading users, rewards, or redemptions:", err);
      }
    };
    loadData();
  }, []);

  const rewardChild = async () => {
    if (!selectedChild || !rewardChildName || rewardChildPoints <= 0) {
      alert("Please select a child, enter a reward, and set a valid point amount.");
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const rewardChore = {
      choreText: rewardChildName.trim(),
      points: rewardChildPoints,
      assignedTo: parseInt(selectedChild),
      dateAssigned: currentDate,
      completed: false
    };

    try {
      const result = await rewardAsChore(rewardChore);
      const childUser = children.find(c => c.userId === parseInt(selectedChild));
      const childName = childUser ? childUser.username : `user ${selectedChild}`;
      alert(`Reward chore assigned to ${childName} for "${rewardChildName}"!`);
      setSelectedChild("");
      setRewardChildName("");
      setRewardChildPoints(10);
    } catch (err) {
      console.error("Error assigning chore:", err);
      alert("Could not assign reward chore.");
    }
  };

  const addReward = async () => {
    if (!newRewardName.trim() || newRewardPoints <= 0) {
      alert("Please enter a valid reward name and cost.");
      return;
    }

    try {
      const newReward = {
        name: newRewardName,
        cost: newRewardPoints,
      };
      const saved = await postReward(newReward);
      setRewards([...rewards, saved]);

      setNewRewardName("");
      setNewRewardPoints(10);
    } catch (err) {
      console.error("Error adding reward:", err);
    }
  };

  const saveEdit = async () => {
    try {
      await updateReward(editingReward, {
        rewardId: editingReward,
        name: editedRewardName,
        cost: editedRewardCost,
      });

      setRewards(rewards.map(r =>
        r.rewardId === editingReward
          ? { ...r, name: editedRewardName, cost: editedRewardCost }
          : r
      ));
      setEditingReward(null);
      setEditedRewardName("");
      setEditedRewardCost(0);
    } catch (err) {
      console.error("Failed to save reward:", err);
    }
  };

  const deleteReward = async (id) => {
    try {
      await deleteRewardAPI(id);
      setRewards(rewards.filter(r => r.rewardId !== id));
    } catch (err) {
      console.error("Failed to delete reward:", err);
    }
  };

  return (
    <div className="rewards-container">
      <h2>Parent Rewards Management</h2>

      <h3>Reward A Child (Extra Points)</h3>
      <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
        <option value="">Select a child...</option>
        {children.map(child => (
          <option key={child.userId} value={child.userId}>
            {child.username}
          </option>
        ))}
      </select>

      <label>Reward Name:</label>
      <input type="text" value={rewardChildName} onChange={(e) => setRewardChildName(e.target.value)} placeholder="e.g., Extra Playtime" />

      <label>Points:</label>
      <input type="number" value={rewardChildPoints} onChange={(e) => setRewardChildPoints(Number(e.target.value))} min="1" max="500" />

      <button onClick={rewardChild}>Assign Reward Task</button>

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
            <li key={reward.rewardId} className="reward-item">
              {editingReward === reward.rewardId ? (
                <>
                  <input type="text" value={editedRewardName} onChange={(e) => setEditedRewardName(e.target.value)} />
                  <input type="number" value={editedRewardCost} onChange={(e) => setEditedRewardCost(Number(e.target.value))} />
                  <button onClick={saveEdit}>💾</button>
                  <button onClick={() => setEditingReward(null)}>❌</button>
                </>
              ) : (
                <>
                  <span>{reward.name} - {reward.cost} Points</span>
                  <div className="reward-actions">
                    <button onClick={() => {
                      setEditingReward(reward.rewardId);
                      setEditedRewardName(reward.name);
                      setEditedRewardCost(reward.cost);
                    }}>✏️</button>
                    <button onClick={() => deleteReward(reward.rewardId)}>🗑️</button>
                  </div>
                </>
              )}
            </li>
          ))}
      </ul>

      <hr />

      <h3>Redeemed Rewards History (Grouped by Child)</h3>
      {Object.keys(redeemedRewards).length === 0 ? (
        <p>No redeemed rewards yet.</p>
      ) : (
        Object.entries(redeemedRewards).map(([childName, rewardsList]) => (
          <div key={childName} className="child-redeemed-block">
            <h4>{childName}</h4>
            {rewardsList.length === 0 ? (
              <p>No redemptions.</p>
            ) : (
              <ul className="redeemed-list">
                {rewardsList.map((reward) => (
                  <li key={reward.redemptionId}>
                    {reward.rewardName || reward.name || reward.Reward?.name || "Unnamed Reward"} - {reward.pointsSpent} Points
                    <br />
                    <small>Redeemed on: {new Date(reward.dateRedeemed).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ParentRewards;
