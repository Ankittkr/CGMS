import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchDepartments = createAsyncThunk(
  'department/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/departments');
      return response.data.departments;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'department/createDepartment',
  async (deptData, { rejectWithValue }) => {
    try {
      const response = await api.post('/departments', deptData);
      return response.data.department;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'department/updateDepartment',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/departments/${id}`, data);
      return response.data.department;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'department/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  departments: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearDepartmentSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
        state.successMessage = 'Department created successfully';
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const updated = action.payload;
        state.departments = state.departments.map((d) =>
          d._id === updated._id ? updated : d
        );
        state.successMessage = 'Department updated successfully';
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d._id !== action.payload);
        state.successMessage = 'Department removed successfully';
      });
  },
});

export const { clearDepartmentError, clearDepartmentSuccess } = departmentSlice.actions;
export default departmentSlice.reducer;
