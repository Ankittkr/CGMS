import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchReportsAnalytics = createAsyncThunk(
  'dashboard/fetchReportsAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/reports', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    escalated: 0,
  },
  recentGrievances: [],
  reports: {
    statusCounts: [],
    priorityCounts: [],
    departmentDistribution: [],
    categoryDistribution: [],
    monthlyTrends: [],
  },
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentGrievances = action.payload.recentGrievances;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reports
      .addCase(fetchReportsAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReportsAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReportsAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
