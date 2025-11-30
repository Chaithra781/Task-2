import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getEmployeeDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard/employee`, getAuthHeaders());
  return response.data;
};

export const getManagerDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard/manager`, getAuthHeaders());
  return response.data;
};

