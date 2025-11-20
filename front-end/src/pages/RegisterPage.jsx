import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Container, Form, FormControl, FormGroup, FormLabel, Image, Spinner} from "react-bootstrap";
import '../styles/Login.css';
import authService from "../services/authService";
import Alert from "../common/Alert.jsx";
import {useDispatch} from "react-redux";
import {setCredentials} from "../features/auth/authSlice.js";

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        // Clear error
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

        // Kiểm tra mật khẩu xác nhận
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            setShowAlert(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.register(formData);

            if (response.success) {
                // Sau khi đăng ký thành công, thực hiện login action và redirect
                dispatch(setCredentials({user: response.data.user}, {token: response.data.token}));

                // Redirect đến dashboard sau khi đăng ký thành công
                navigate('/dashboard', {replace: true});
            }
        } catch (err) {
            console.error("Registration failed:", err);
            let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

            if (err.message) {
                // Xử lý các loại lỗi cụ thể
                if (err.message.includes('tên đăng nhập') || err.message.includes('userName')) {
                    errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.';
                } else if (err.message.includes('email')) {
                    errorMessage = 'Email đã tồn tại hoặc không hợp lệ. Vui lòng kiểm tra lại.';
                } else if (err.message.includes('@fpt.com')) {
                    errorMessage = 'Email phải sử dụng domain @fpt.com';
                } else if (err.message.includes('mật khẩu') || err.message.includes('password')) {
                    errorMessage = 'Mật khẩu phải có ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
            setShowAlert(true);
        } finally {
            setIsLoading(false);
            // Clear sensitive fields after request completes
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
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
                                <Image src="/login.svg" alt="Register Image" className="illustration-img"/>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="login-form-section">
                            <div className="form-panel">
                                <div className="text-center mb-4">
                                    <h2 className="login-title mb-2">Đăng ký tài khoản</h2>
                                    <h4 className="login-subtitle">SALE ONLINE PLATFORM</h4>
                                </div>

                                <Form onSubmit={handleSubmit} noValidate>
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

                                    <FormGroup className="mb-3">
                                        <FormLabel className="form-label">
                                            <i className="bi bi-envelope-fill me-2"></i>
                                            Email
                                        </FormLabel>
                                        <FormControl
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Nhập địa chỉ email @fpt.com"
                                            required
                                            disabled={isLoading}
                                            className="custom-input"
                                            pattern="^[^\s@]+@fpt\.com$"
                                            title="Email phải sử dụng domain @fpt.com"
                                        />
                                    </FormGroup>

                                    <FormGroup className="mb-3">
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
                                            minLength={12}
                                            pattern={"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]+$"}
                                            title="Mật khẩu phải có ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                                        />
                                    </FormGroup>

                                    <FormGroup className="mb-4">
                                        <FormLabel className="form-label">
                                            <i className="bi bi-lock-fill me-2"></i>
                                            Xác nhận mật khẩu
                                        </FormLabel>
                                        <FormControl
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Nhập lại mật khẩu"
                                            required
                                            disabled={isLoading}
                                            className="custom-input"
                                        />
                                    </FormGroup>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={isLoading || !formData.userName || !formData.email || !formData.password || !formData.confirmPassword}
                                        className="w-100 mb-3 sign-in-btn"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2"/>
                                                Đang đăng ký...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-plus me-2"></i>
                                                Đăng ký
                                            </>
                                        )}
                                    </Button>
                                </Form>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Đã có tài khoản?
                                        <a href="/" className="ms-1 text-decoration-none fw-bold">
                                            Đăng nhập ngay
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

export default RegisterPage;