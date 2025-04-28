// api.js (Fully updated with labels)

import axios from 'axios';

const FORCE_HTTP = true;

const api = axios.create({
  baseURL: FORCE_HTTP
    ? 'http://localhost:5073/api'
    : `${window.location.protocol}//localhost:5073/api`,
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// -------------------- Chore APIs --------------------

// Fetch all chores
export const fetchChores = async () => {
  const response = await api.get('/Chores');
  return response.data;
};

// Post a new chore
export const postChore = async (chore) => {
  const response = await api.post('/Chores', chore);
  return response.data;
};

// Complete an existing chore
export const completeChore = async (choreId, updatedChore) => {
  const response = await api.put(`/Chores/${choreId}`, updatedChore);
  return response.data;
};

// Move chore to completed chores
export const moveChoreToCompleted = async (choreId) => {
  const response = await api.post(`/Chores/complete/${choreId}`);
  return response.data;
};

// Fetch completed chores
export const fetchCompletedChores = async () => {
  const response = await api.get('/CompletedChores');
  return response.data;
};

// Undo a completed chore
export const undoCompletedChore = async (completedChoreId) => {
  const response = await api.post(`/CompletedChores/undo/${completedChoreId}`);
  return response.data;
};

// Delete a chore
export const deleteChore = async (choreId) => {
  await api.delete(`/Chores/${choreId}`);
};

// -------------------- Reward APIs --------------------

// Fetch all rewards
export const fetchRewards = async () => {
  const res = await api.get('/Rewards');
  return res.data;
};

// Post a new reward
export const postReward = async (reward) => {
  const res = await api.post('/Rewards', reward);
  return res.data;
};

// Update an existing reward
export const updateReward = async (rewardId, reward) => {
  const res = await api.put(`/Rewards/${rewardId}`, reward);
  return res.data;
};

// Delete a reward
export const deleteReward = async (rewardId) => {
  await api.delete(`/Rewards/${rewardId}`);
};

// Reward by posting a chore
export const rewardAsChore = async (chore) => {
  const res = await api.post('/Chores', chore);
  return res.data;
};

// Fetch redeemed rewards for a user
export const fetchRedeemedRewards = async (userId) => {
  const res = await api.get(`/RedeemedRewards/${userId}`);
  return res.data;
};

// Post a new redeemed reward
export const postRedeemedReward = async (data) => {
  const res = await api.post(`/RedeemedRewards`, data);
  return res.data;
};

// -------------------- User APIs --------------------

// Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await api.get('/Users');
    return response.data;
  } catch (err) {
    console.error("fetchUsers error:", err.message);
    throw err;
  }
};

// Create/login user
export const loginUser = async (email, password) => {
  const response = await api.post('/Auth/login', { email, password });
  return response.data;
};

// Update user details
export const updateUser = async (userId, userData) => {
  const res = await api.put(`/Users/${userId}`, userData);
  return res.data;
};

// add child or parent to a team
export const addUserToTeam = async (email, teamId) => {
  const res = await api.post('/users/addUserToTeam', {
    email,
    teamId
  });
  return res.data;
};



// -------------------- Team APIs --------------------

// Fetch team details
export const fetchTeam = async (teamId) => {
  try {
    const response = await api.get(`/users/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch team details:", error.message);
    throw error;
  }
};

// Join an existing team
export const joinTeam = async (userId, teamName, teamPassword) => {
  const res = await api.post('/users/joinTeam', {
    userId,
    teamName,
    teamPassword
  });
  return res.data;
};

// Create a new team
export const createTeam = async (userId, teamName, teamPassword) => {
  const res = await api.post('/users/createTeam', {
    userId,
    teamName,
    teamPassword
  });
  return res.data;
};
