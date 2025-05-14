// File Name: api.js 


import axios from 'axios';

// ✅ Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5073/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

//
// ==================================================
// ✅ CHORE APIs
// ==================================================
//

// 🔹 Fetch all active chores
export const fetchChores = async () => {
  const response = await api.get('/Chores');
  return response.data;
};

// 🔹 Post a new chore
export const postChore = async (chore) => {
  const response = await api.post('/Chores', chore);
  return response.data;
};

// 🔹 Update an existing chore (generic PUT)
export const completeChore = async (choreId, updatedChore) => {
  const response = await api.put(`/Chores/${choreId}`, updatedChore);
  return response.data;
};

// 🔹 Move chore to CompletedChores
export const moveChoreToCompleted = async (choreId) => {
  const response = await api.post(`/Chores/complete/${choreId}`);
  return response.data;
};

// 🔹 Fetch all completed chores (new endpoint from ChoresController)
export const fetchCompletedChores = async () => {
  const response = await api.get('/Chores/completed');
  return response.data;
};

// 🔹 Undo completed chore — also subtracts points from user
export const undoCompletedChore = async (completedChoreId) => {
  const response = await api.post(`/Chores/undoComplete/${completedChoreId}`);
  return response.data;
};

// 🔹 Delete a chore
export const deleteChore = async (choreId) => {
  await api.delete(`/Chores/${choreId}`);
};

//
// ==================================================
// ✅ REWARD APIs
// ==================================================
//

// 🔹 Fetch all rewards
export const fetchRewards = async () => {
  const res = await api.get('/Rewards');
  return res.data;
};

// 🔹 Post a new reward
export const postReward = async (reward) => {
  const res = await api.post('/Rewards', reward);
  return res.data;
};

// 🔹 Update a reward
export const updateReward = async (rewardId, reward) => {
  const res = await api.put(`/Rewards/${rewardId}`, reward);
  return res.data;
};

// 🔹 Delete a reward
export const deleteReward = async (rewardId) => {
  await api.delete(`/Rewards/${rewardId}`);
};

// 🔹 Reward a user by creating a chore
export const rewardAsChore = async (chore) => {
  const res = await api.post('/Chores', chore);
  return res.data;
};

// 🔹 Fetch redeemed rewards
export const fetchRedeemedRewards = async (userId) => {
  const res = await api.get(`/RedeemedRewards/${userId}`);
  return res.data;
};

// 🔹 Redeem a reward
export const postRedeemedReward = async (data) => {
  const res = await api.post(`/RedeemedRewards`, data);
  return res.data;
};

//
// ==================================================
// ✅ USER APIs
// ==================================================
//

// 🔹 Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await api.get('/Users');
    return response.data;
  } catch (err) {
    console.error("fetchUsers error:", err.message);
    throw err;
  }
};

// 🔹 Login a user
export const loginUser = async (email, password) => {
  const response = await api.post('/Auth/login', { email, password });
  return response.data;
};

// 🔹 Update user info
export const updateUser = async (userId, userData) => {
  const res = await api.put(`/Users/${userId}`, userData);
  return res.data;
};

// 🔹 Update user Points
export const updateUserPoints = async (userId, newPoints) => {
  const response = await api.put(`/Users/${userId}/points`, { points: newPoints });
  return response.data;
};


// 🔹 Add a user to a team
export const addUserToTeam = async (email, teamId) => {
  const res = await api.post('/users/addUserToTeam', {
    email,
    teamId
  });
  return res.data;
};
// 🔹 Remove a user from a team
export const removeUserFromTeam = async (userId) => {
  const res = await api.post(`/users/removeFromTeam/${userId}`);
  return res.data;
};


//
// ==================================================
// ✅ TEAM APIs
// ==================================================
//

// 🔹 Fetch team details by ID
export const fetchTeam = async (teamId) => {
  try {
    const response = await api.get(`/users/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch team details:", error.message);
    throw error;
  }
};

// 🔹 Join an existing team
export const joinTeam = async (userId, teamName, teamPassword) => {
  const res = await api.post('/users/joinTeam', {
    userId,
    teamName,
    teamPassword
  });
  return res.data;
};

// 🔹 Create a new team
export const createTeam = async (userId, teamName, teamPassword) => {
  const res = await api.post('/users/createTeam', {
    userId,
    teamName,
    teamPassword
  });
  return res.data;
};
