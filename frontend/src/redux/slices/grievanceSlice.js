import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchGrievances = createAsyncThunk(
  'grievance/fetchGrievances',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/grievances', { params });
      return response.data.grievances;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchGrievanceById = createAsyncThunk(
  'grievance/fetchGrievanceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/grievances/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitGrievance = createAsyncThunk(
  'grievance/submitGrievance',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/grievances', formData);
      return response.data.grievance;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateGrievanceStatus = createAsyncThunk(
  'grievance/updateGrievanceStatus',
  async ({ id, status, remarks, resolutionNotes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/grievances/${id}/status`, {
        status,
        remarks,
        resolutionNotes,
      });
      return response.data.grievance;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const assignGrievance = createAsyncThunk(
  'grievance/assignGrievance',
  async ({ id, resolverId, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/grievances/${id}/assign`, {
        resolverId,
        remarks,
      });
      return response.data.grievance;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const reopenGrievance = createAsyncThunk(
  'grievance/reopenGrievance',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/grievances/${id}/reopen`, { reason });
      return response.data.grievance;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const escalateGrievance = createAsyncThunk(
  'grievance/escalateGrievance',
  async ({ id, escalateToRole, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/grievances/${id}/escalate`, {
        escalateToRole,
        reason,
      });
      return response.data.grievance;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'grievance/submitFeedback',
  async ({ id, rating, comments }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/grievances/${id}/feedback`, {
        rating,
        comments,
      });
      return response.data.feedback;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  grievances: [],
  currentGrievance: null,
  feedback: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
};

const grievanceSlice = createSlice({
  name: 'grievance',
  initialState,
  reducers: {
    clearGrievanceError: (state) => {
      state.error = null;
    },
    clearGrievanceSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentGrievance: (state) => {
      state.currentGrievance = null;
      state.feedback = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchGrievances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGrievances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.grievances = action.payload;
      })
      .addCase(fetchGrievances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch single
      .addCase(fetchGrievanceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGrievanceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGrievance = action.payload.grievance;
        state.feedback = action.payload.feedback;
      })
      .addCase(fetchGrievanceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit
      .addCase(submitGrievance.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitGrievance.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.grievances.unshift(action.payload);
        state.successMessage = `Grievance #${action.payload.grievanceId} lodged successfully!`;
      })
      .addCase(submitGrievance.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.grievances = state.grievances.map((g) =>
          g._id === updated._id ? updated : g
        );
        if (state.currentGrievance?._id === updated._id) {
          state.currentGrievance = updated;
        }
        state.successMessage = `Status updated to "${updated.status}"`;
      })
      // Assign
      .addCase(assignGrievance.fulfilled, (state, action) => {
        const updated = action.payload;
        state.grievances = state.grievances.map((g) =>
          g._id === updated._id ? updated : g
        );
        if (state.currentGrievance?._id === updated._id) {
          state.currentGrievance = updated;
        }
        state.successMessage = 'Grievance assigned successfully';
      })
      // Reopen
      .addCase(reopenGrievance.fulfilled, (state, action) => {
        const updated = action.payload;
        state.grievances = state.grievances.map((g) =>
          g._id === updated._id ? updated : g
        );
        if (state.currentGrievance?._id === updated._id) {
          state.currentGrievance = updated;
        }
        state.successMessage = 'Grievance reopened successfully';
      })
      // Escalate
      .addCase(escalateGrievance.fulfilled, (state, action) => {
        const updated = action.payload;
        state.grievances = state.grievances.map((g) =>
          g._id === updated._id ? updated : g
        );
        if (state.currentGrievance?._id === updated._id) {
          state.currentGrievance = updated;
        }
        state.successMessage = 'Grievance escalated successfully';
      })
      // Feedback
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload;
        state.successMessage = 'Resolution feedback submitted successfully';
      });
  },
});

export const {
  clearGrievanceError,
  clearGrievanceSuccess,
  clearCurrentGrievance,
} = grievanceSlice.actions;

export default grievanceSlice.reducer;
