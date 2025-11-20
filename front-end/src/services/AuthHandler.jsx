import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import {logout, selectCurrentToken, setCredentials} from '../features/auth/authSlice';
import {getUserProfile} from "./userService.js";
import PropTypes from "prop-types";
import {Spinner} from "react-bootstrap";

const AuthHandler = ({children}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector(selectCurrentToken); // Lấy token từ Redux store
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUserToken = async () => {
            if (token) { // Nếu có token
                try {
                    const userProfile = await getUserProfile();
                    // Dispatch action để lưu user vào Redux store
                    dispatch(setCredentials({user: userProfile, token: token}));
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Dispatch action logout nếu token không hợp lệ
                    dispatch(logout());
                    navigate("/"); // Điều hướng về trang login
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // Không có token
            }
        };

        verifyUserToken();
    }, [dispatch, token]); // Chạy lại nếu token thay đổi
    return loading ? <Spinner animation="border"/> : children;
}

AuthHandler.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AuthHandler;
