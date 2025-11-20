import React from 'react';
import AppProvider from "./services/AppProvider.jsx";
import AuthHandler from "./services/AuthHandler.jsx";
import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "./features/auth/authSlice.js";
import Layout from "./common/Layout.jsx";

function App() {

    // Route cho người dùng đã đăng nhập
    const ProtectedRoute = () => {
        const user = useSelector(selectCurrentUser);
        return user ? <Layout><Outlet/></Layout> : <Navigate to="/"/>;
    };

    // Route cho Admin
    const AdminRoute = () => {
        const user = useSelector(selectCurrentUser);

        // Kiểm tra xem đã đăng nhập VÀ có phải là Admin không
        const isAdmin = user && user.role?.name === 'Admin';

        return isAdmin ? <Layout><Outlet/></Layout> : <Navigate to="/dashboard" replace/>;
    };

    const PublicRoute = () => {
        const user = useSelector(selectCurrentUser);
        return !user ? <Outlet/> : <Navigate to="/dashboard"/>;
    };

    return (
        <AppProvider>
            <BrowserRouter>
                <AuthHandler>
                    <Routes>
                        {/* Các route công khai */}
                        <Route element={<PublicRoute/>}>
                            <Route path="/" element={<LoginPage/>}/>
                            <Route path="/register" element={<RegisterPage/>}/>
                        </Route>

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute/>}>
                            <Route path="/dashboard" element={<div><p>Chào mừng...</p></div>}/>
                            <Route path="/profile" element={<ProfilePage/>}/>
                        </Route>

                        {/* Protected routes for admin */}
                        <Route element={<AdminRoute/>}>
                            <Route path="/admin" element={<Navigate to="/admin/users" replace/>}/>
                            <Route path="/admin/users" element={<UserManagement/>}/>
                        </Route>

                        {/* Route cho trang 404 */}
                        <Route path="*" element={<div>Trang không tìm thấy</div>}/>
                    </Routes>
                </AuthHandler>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;