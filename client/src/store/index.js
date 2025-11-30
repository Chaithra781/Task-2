import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
  },
});

