import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', { params });
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchResolvers = createAsyncThunk(
  'user/fetchResolvers',
  async (department, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/resolvers', {
        params: department ? { department } : {},
      });
      return response.data.resolvers;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async ({ id, role, department }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role, department });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'user/toggleUserStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  users: [],
  resolvers: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch resolvers
      .addCase(fetchResolvers.fulfilled, (state, action) => {
        state.resolvers = action.payload;
      })
      // Update role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload;
        state.users = state.users.map((u) => (u._id === updated._id ? updated : u));
        state.successMessage = 'User role updated successfully';
      })
      // Toggle status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { _id, isActive } = action.payload;
        state.users = state.users.map((u) =>
          u._id === _id ? { ...u, isActive } : u
        );
        state.successMessage = `User account status changed to ${isActive ? 'Active' : 'Inactive'}`;
      });
  },
});

export const { clearUserError, clearUserSuccess } = userSlice.actions;
export default userSlice.reducer;
