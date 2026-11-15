import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (department = '', { rejectWithValue }) => {
    try {
      const response = await api.get('/categories', {
        params: department ? { department } : {},
      });
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (catData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', catData);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  categories: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    clearCategorySuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.successMessage = 'Category created successfully';
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updated = action.payload;
        state.categories = state.categories.map((c) =>
          c._id === updated._id ? updated : c
        );
        state.successMessage = 'Category updated successfully';
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
        state.successMessage = 'Category removed successfully';
      });
  },
});

export const { clearCategoryError, clearCategorySuccess } = categorySlice.actions;
export default categorySlice.reducer;
