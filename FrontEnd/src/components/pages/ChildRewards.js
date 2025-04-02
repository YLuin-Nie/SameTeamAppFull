// File Name: ChildRewards.js

import React, { useState, useEffect } from "react";
import { getCurrentUser, getUsers, saveUsers, getUnspentPoints, getRewards, storeRedeemedReward, getRedeemedRewards } from "../utils/localStorageUtils";

function ChildRewards() {
    const [points, setPoints] = useState(0);
    const [rewards, setRewards] = useState([]);
    const [redeemedRewards, setRedeemedRewards] = useState([]);
    const currentUser = getCurrentUser();

    useEffect(() => {
        if (currentUser) {
            setPoints(getUnspentPoints(currentUser.username));
            setRewards(getRewards()); // ✅ Load rewards from localStorage
            setRedeemedRewards(getRedeemedRewards().filter(reward => reward.username === currentUser.username)); // ✅ Load redeemed rewards
        }
    }, [currentUser]);

    // Function to purchase a reward
    const purchaseReward = (reward) => {
        if (points >= reward.cost) {
            const users = getUsers();
            const updatedUsers = users.map(user => {
                if (user.username === currentUser.username) {
                    return { ...user, points: user.points - reward.cost };
                }
                return user;
            });

            saveUsers(updatedUsers);
            setPoints(prevPoints => prevPoints - reward.cost);

            // ✅ Store redeemed reward
            storeRedeemedReward(currentUser.username, reward.name, reward.cost);

            // ✅ Update redeemed rewards in UI
            setRedeemedRewards(prevRewards => [
                ...prevRewards,
                {
                    id: Date.now(),
                    username: currentUser.username,
                    rewardName: reward.name,
                    pointsSpent: reward.cost,
                    date: new Date().toISOString(),
                }
            ]);

            alert(`You have successfully purchased: ${reward.name}`);
        } else {
            alert("Not enough points to purchase this reward.");
        }
    };

    return (
        <div className="rewards-container">
            <h2>Available Rewards</h2>
            <p><strong>Unspent Points:</strong> {points}</p>
            <ul>
                {rewards.length === 0 ? <p>No rewards available.</p> :
                    rewards.map(reward => (
                        <li key={reward.id}>
                            {reward.name} - {reward.cost} Points
                            <button onClick={() => purchaseReward(reward)}>Redeem</button>
                        </li>
                    ))
                }
            </ul>

            <hr />

            <h3>Redeemed Rewards History</h3>
            {redeemedRewards.length === 0 ? (
                <p>You have not redeemed any rewards yet.</p>
            ) : (
                <ul>
                    {redeemedRewards.map(reward => (
                        <li key={reward.id}>
                            {reward.rewardName} - {reward.pointsSpent} Points (Redeemed on {new Date(reward.date).toLocaleDateString()})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChildRewards;
