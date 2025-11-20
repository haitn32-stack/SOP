import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
    reducer: {
        // Đăng ký tất cả các slice reducer
        auth: authReducer,
    },
});