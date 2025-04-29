// File name: ChildRewards.js

import React, { useState, useEffect } from "react";
import {
  fetchUsers,
  fetchRewards,
  fetchRedeemedRewards,
  postRedeemedReward,
  updateUserPoints
} from "../../api/api";
import { getCurrentUser } from "../../utils/auth";

function ChildRewards() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, rewardsData, redeemedData] = await Promise.all([
          fetchUsers(),
          fetchRewards(),
          fetchRedeemedRewards(currentUser.userId)
        ]);

        const user = usersData.find(u => u.userId === currentUser.userId);
        setPoints(user?.points || 0);
        setRewards(rewardsData);
        setRedeemedRewards(redeemedData);
      } catch (err) {
        console.error("Failed to load user or rewards:", err);
      }
    };

    loadData();
  }, []);

  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      alert("Not enough points to redeem this reward.");
      return;
    }

    try {
      const redemption = {
        userId: currentUser.userId,
        rewardId: reward.rewardId,
        rewardName: reward.name,
        pointsSpent: reward.cost,
        dateRedeemed: new Date().toISOString().split('T')[0] // Only YYYY-MM-DD
      };

      // ✅ Send to backend and capture real response
      const savedRedemption = await postRedeemedReward(redemption);

      // ✅ Update backend points
      const updatedPoints = points - reward.cost;
      await updateUserPoints(currentUser.userId, updatedPoints);

      // ✅ Update frontend
      setPoints(updatedPoints);
      setRedeemedRewards(prev => [savedRedemption, ...prev]);

      alert(`You redeemed: ${reward.name}`);
    } catch (err) {
      console.error("Failed to redeem reward:", err);
      alert("Could not complete redemption.");
    }
  };

  return (
    <div className="rewards-container">
      <h2>Available Rewards</h2>
      <p><strong>Unspent Points:</strong> {points}</p>

      <ul className="reward-list">
        {rewards.length === 0 ? (
          <p>No rewards available.</p>
        ) : (
          rewards.map((reward) => (
            <li key={reward.rewardId} className="reward-item">
              <span>{reward.name} - {reward.cost} Points</span>
              <div className="reward-actions">
                <button onClick={() => handleRedeem(reward)}>Redeem</button>
              </div>
            </li>
          ))
        )}
      </ul>

      <hr />

      <h3>Redeemed Rewards History</h3>
      {redeemedRewards.length === 0 ? (
        <p>You haven't redeemed any rewards yet.</p>
      ) : (
        <ul className="redeemed-list">
          {redeemedRewards.map((reward) => (
            <li key={reward.redemptionId}>
              {reward.rewardName || reward.name} - {reward.pointsSpent} Points
              <br />
              <small>Redeemed on: {new Date(reward.dateRedeemed).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ChildRewards;
