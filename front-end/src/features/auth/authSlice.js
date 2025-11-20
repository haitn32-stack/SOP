import {createSlice} from '@reduxjs/toolkit';

// Lấy token ban đầu từ localStorage nếu có
const token = localStorage.getItem('token') || null;

const initialState = {
    user: null,    // Thông tin người dùng
    token: token,  // Access token
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action để cập nhật user và token khi đăng nhập thành công
        setCredentials: (state, action) => {
            const {user, token} = action.payload;
            state.user = user;
            state.token = token;
            localStorage.setItem('token', token);
        },
        // Action để xóa user và token khi đăng xuất
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
        // Action để cập nhật thông tin user
        updateUser: (state, action) => {
            state.user = {...state.user, ...action.payload};
        }
    },
});

// Export các actions để sử dụng trong common
export const {
    setCredentials,
    logout,
    updateUser
} = authSlice.actions;

// Export reducer để đăng ký vào store
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;