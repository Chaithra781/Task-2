import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Employee attendance actions
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/attendance/checkin`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/attendance/checkout`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-out failed');
    }
  }
);

export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = month && year ? { month, year } : {};
      const response = await axios.get(`${API_URL}/attendance/my-history`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get history');
    }
  }
);

export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = month && year ? { month, year } : {};
      const response = await axios.get(`${API_URL}/attendance/my-summary`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get summary');
    }
  }
);

export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/today`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get today status');
    }
  }
);

// Manager attendance actions
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/all`, {
        ...getAuthHeaders(),
        params: filters
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get attendance');
    }
  }
);

export const getTeamSummary = createAsyncThunk(
  'attendance/getTeamSummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = month && year ? { month, year } : {};
      const response = await axios.get(`${API_URL}/attendance/summary`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get team summary');
    }
  }
);

export const exportAttendance = createAsyncThunk(
  'attendance/export',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/export`, {
        ...getAuthHeaders(),
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Export failed');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayStatus: null,
    history: [],
    summary: null,
    allAttendance: [],
    teamSummary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.fulfilled, (state, action) => {
        state.todayStatus = action.payload.attendance;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.todayStatus = action.payload.attendance;
      })
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload.attendance;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.allAttendance = action.payload;
      })
      .addCase(getTeamSummary.fulfilled, (state, action) => {
        state.teamSummary = action.payload;
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;

