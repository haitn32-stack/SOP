import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Container, Form, FormControl, FormGroup, FormLabel, Image, Spinner} from "react-bootstrap";
import '../styles/Login.css';
import authService from "../services/authService.js";
import Alert from "../common/Alert.jsx";
import {useDispatch} from "react-redux";
import {setCredentials} from '../features/auth/authSlice';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        userName: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) {
            setError('');
            setShowAlert(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setShowAlert(false);

        try {
            const response = await authService.login(formData);

            // Nếu đăng nhập thành công, redirect đến Sales Platform
            if (response.success && response.data.redirectTo) {
                dispatch(setCredentials({user: response.data.user, token: response.data.token}));
                navigate(response.data.redirectTo, {replace: true});
            }
        } catch (err) {
            console.error("Login failed:", err);
            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

            if (err.message) {
                // Xử lý các trường hợp lỗi khác nhau theo user story
                if (err.data?.requireAuthentication) {
                    // Trường hợp thông tin đăng nhập không chính xác
                    errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
                } else if (err.data?.noSystemAccess) {
                    // Trường hợp không có quyền truy cập hệ thống
                    errorMessage = 'Tài khoản không tồn tại trong hệ thống';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
            setShowAlert(true);
        } finally {
            setIsLoading(false);
            // Clear sensitive field after request completes
            setFormData(prev => ({
                ...prev,
                password: ''
            }));
        }
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
        setError('');
    };

    return (
        <div className="login-page">
            <Alert
                show={showAlert}
                message={error}
                onClose={handleCloseAlert}
                type="danger"
            />
            <Container fluid className="h-100 d-flex align-items-center justify-content-center">
                <div className="login-card">
                    <div className="login-content">
                        {/* Left Side: Image */}
                        <div className="login-image-section">
                            <div className="illustration-wrapper">
                                <Image src="/login.svg" alt="Login Image" className="illustration-img"/>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="login-form-section">
                            <div className="form-panel">
                                <div className="text-center mb-4">
                                    <h2 className="login-title mb-2">Đăng nhập hệ thống</h2>
                                    <h4 className="login-subtitle">SALE ONLINE PLATFORM</h4>
                                </div>

                                <Form onSubmit={handleSubmit}>
                                    <FormGroup className="mb-3">
                                        <FormLabel className="form-label">
                                            <i className="bi bi-person-fill me-2"></i>
                                            Tên đăng nhập
                                        </FormLabel>
                                        <FormControl
                                            type="text"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên đăng nhập"
                                            required
                                            disabled={isLoading}
                                            className="custom-input"
                                        />
                                    </FormGroup>

                                    <FormGroup className="mb-4">
                                        <FormLabel className="form-label">
                                            <i className="bi bi-lock-fill me-2"></i>
                                            Mật khẩu
                                        </FormLabel>
                                        <FormControl
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Nhập mật khẩu"
                                            required
                                            disabled={isLoading}
                                            className="custom-input"
                                        />
                                    </FormGroup>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isLoading || !formData.userName || !formData.password}
                                        className="w-100 mb-3 sign-in-btn"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2"/>
                                                Đang đăng nhập...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Sign In
                                            </>
                                        )}
                                    </Button>
                                </Form>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Chưa có tài khoản?
                                        <a href="/register" className="ms-1 text-decoration-none fw-bold">
                                            Đăng ký ngay
                                        </a>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default LoginPage;