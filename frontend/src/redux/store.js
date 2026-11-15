import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import grievanceReducer from './slices/grievanceSlice.js';
import userReducer from './slices/userSlice.js';
import departmentReducer from './slices/departmentSlice.js';
import categoryReducer from './slices/categorySlice.js';
import notificationReducer from './slices/notificationSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grievance: grievanceReducer,
    user: userReducer,
    department: departmentReducer,
    category: categoryReducer,
    notification: notificationReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
