import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Col, Container, Form, Image, Row, Spinner} from 'react-bootstrap';
import '../styles/ProfilePage.css';
import {updateUserProfile} from "../services/userService.js";
import {uploadAvatar} from "../services/cloudinaryService.js";
import Alert from "../common/Alert.jsx";
import {getAllRoles} from "../services/roleService.js";
import {getDepartments} from "../services/departmentService.js";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentUser, updateUser as updateUserAction} from "../features/auth/authSlice.js";

// Kiểm tra file ảnh
const validateAvatar = (file) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra định dạng
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return reject(new Error('Định dạng ảnh không hợp lệ. Vui lòng chọn file PNG, JPG, hoặc JPEG.'));
        }

        // Kiểm tra dung lượng (tối đa 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeInBytes) {
            return reject(new Error('Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.'));
        }

        // Kiểm tra kích thước (tối thiểu 300x300px)
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const image = new window.Image();
            image.src = e.target.result;
            image.onload = () => {
                if (image.width < 300 || image.height < 300) {
                    return reject(new Error('Kích thước ảnh quá nhỏ. Vui lòng chọn ảnh có kích thước tối thiểu 300x300px.'));
                }
                resolve(true);
            };
            image.onerror = () => {
                return reject(new Error('Không thể đọc file ảnh.'));
            }
        };
        reader.onerror = () => {
            return reject(new Error('Lỗi khi đọc file.'));
        }
    });
};

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('account-info');
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser); // <-- Lấy user từ Redux store
    const [profileData, setProfileData] = useState(null);

    // Gom state cho các dropdown vào 1 object cho gọn
    const [dropdownData, setDropdownData] = useState({
        roles: [],
        parentDepartments: [],
        childDepartments1: [],
        childDepartments2: [],
    });

    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef(null);

    const [alertState, setAlertState] = useState({
        show: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Dùng Promise.all để gọi các API song song
                const [rolesData, parentDeptData] = await Promise.all([
                    getAllRoles(),
                    getDepartments() // Lấy đơn vị chủ quản
                ]);
                setDropdownData(prev => ({
                    ...prev,
                    roles: rolesData,
                    parentDepartments: parentDeptData
                }));
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setAlertState({show: true, message: error.message, type: 'error'});
            }
        };
        fetchInitialData();
    }, []); // Chỉ chạy 1 lần khi component mount

    /**
     * Effect này sẽ chạy mỗi khi `parentDepartmentId` trong `profileData` thay đổi.
     * Dùng để tải danh sách "Phòng ban 1" tương ứng với "Đơn vị chủ quản" đã chọn.
     */
    useEffect(() => {
        const fetchChildDept1 = async () => {
            if (profileData?.parentDepartmentId) {
                try {
                    const data = await getDepartments(profileData.parentDepartmentId);
                    setDropdownData(prev => ({...prev, childDepartments1: data}));
                } catch (error) {
                    setDropdownData(prev => ({...prev, childDepartments1: []}));
                    console.error(error);
                }
            } else {
                setDropdownData(prev => ({...prev, childDepartments1: []}));
            }
        };
        fetchChildDept1();
    }, [profileData?.parentDepartmentId]);

    /**
     * Tương tự, effect này chạy khi `childDepartment1Id` thay đổi.
     * Dùng để tải danh sách "Phòng ban 2" tương ứng.
     */
    useEffect(() => {
        const fetchChildDept2 = async () => {
            if (profileData?.childDepartment1Id) {
                try {
                    const data = await getDepartments(profileData.childDepartment1Id);
                    setDropdownData(prev => ({...prev, childDepartments2: data}));
                } catch (error) {
                    setDropdownData(prev => ({...prev, childDepartments2: []}));
                    console.error(error);
                }
            } else {
                setDropdownData(prev => ({...prev, childDepartments2: []}));
            }
        };
        fetchChildDept2();
    }, [profileData?.childDepartment1Id]);

    // Tự động ẩn alert sau 5 giây
    useEffect(() => {
        if (alertState.show) {
            const timer = setTimeout(() => {
                setAlertState(prev => ({...prev, show: false}));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertState.show]);

    /**
     * Effect để đồng bộ dữ liệu từ context `user` vào state cục bộ `profileData`.
     * Đồng thời "làm sạch" dữ liệu: chuyển các giá trị `null` thành chuỗi rỗng `''`
     * để tránh lỗi "uncontrolled to controlled input" của React.
     */
    useEffect(() => {
        if (user) {
            const sanitizedData = {...user};
            Object.keys(sanitizedData).forEach(key => {
                if (sanitizedData[key] === null) {
                    sanitizedData[key] = '';
                }
            });
            setProfileData(sanitizedData);
        } else {
            setProfileData(null); // Reset nếu user logout
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        const newProfileData = {...profileData, [field]: value};

        // Logic reset các dropdown phụ thuộc
        if (field === 'parentDepartmentId') {
            newProfileData.childDepartment1Id = '';
            newProfileData.childDepartment2Id = '';
            setDropdownData(prev => ({
                ...prev,
                childDepartments1: [],
                childDepartments2: []
            }));
        }
        if (field === 'childDepartment1Id') {
            newProfileData.childDepartment2Id = '';
            setDropdownData(prev => ({
                ...prev,
                childDepartments2: []
            }));
        }
        setProfileData(newProfileData);
    };

    const handleUpdateRequest = async () => {
        setIsUpdating(true); // Bắt đầu loading
        try {
            // Gọi API để cập nhật
            const response = await updateUserProfile(profileData);

            // Dispatch action để cập nhật user trong Redux store
            dispatch(updateUserAction(response.user));

            setAlertState({show: true, message: 'Cập nhật thông tin thành công!', type: 'success'});
        } catch (error) {
            console.error(error);
            setAlertState({show: true, message: error.message, type: 'error'});
        } finally {
            setIsUpdating(false); // Kết thúc loading
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Kiểm tra file
            await validateAvatar(file);

            // Upload
            setIsUploading(true);

            const newAvatarUrl = await uploadAvatar(file);

            dispatch(updateUserAction({avatar: newAvatarUrl})); // Cập nhật Redux
            setProfileData(prev => ({...prev, avatar: newAvatarUrl})); // Cập nhật state cục bộ

            setAlertState({show: true, message: 'Cập nhật ảnh đại diện thành công!', type: 'success'});

        } catch (error) {
            console.error(error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi upload ảnh.';
            setAlertState({show: true, message: errorMessage, type: 'error'});
        } finally {
            setIsUploading(false);
        }
    };

    // Kiểm tra nếu đang loading hoặc chưa có profile data
    if (!profileData) {
        return <Spinner animation="border"/>;
    }

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };


    return (
        <Container fluid className="profile-page">
            <Alert
                show={alertState.show}
                type={alertState.type}
                message={alertState.message}
                onClose={() => setAlertState(prev => ({...prev, show: false}))}
            />
            <Row>
                {/* Left Column - User Info */}
                <Col lg={3} className="mb-4">
                    <Card className="profile-card profile-sidebar">
                        <Card.Body className="p-0">
                            <div className="user-info-section">
                                <div className="user-avatar-section text-center mb-4">
                                    <div className="avatar-wrapper">
                                        <Image
                                            src={profileData.avatar}
                                            roundedCircle
                                            width={90}
                                            height={90}
                                        />
                                    </div>
                                    <h4 className="user-name mt-3 mb-1">{profileData.fullName}</h4>
                                    <p className="user-position text-muted mb-1">{profileData.role?.name}</p>
                                </div>

                                <div className="contact-info">
                                    <div className="contact-item mb-2">
                                        <span>{profileData.email}</span>
                                    </div>
                                    <div className="contact-item mb-3">
                                        <span>{profileData.company}</span>
                                    </div>
                                </div>

                                <div className="account-actions">
                                    <div
                                        className={`action-item ${activeTab === 'account-info' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('account-info')}
                                    >
                                        Thông tin tài khoản
                                    </div>
                                    <div
                                        className={`action-item ${activeTab === 'config' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('config')}
                                    >
                                        Cấu hình tài khoản
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Form Fields */}
                <Col lg={9}>
                    <Card className="profile-card">
                        <Card.Body className="p-4">
                            <h4 className="mb-4">Thông tin tài khoản</h4>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <Image
                                        src={profileData.avatar}
                                        roundedCircle
                                        width={90}
                                        height={90}
                                        className="small-avatar"
                                    />
                                    <div className="avatar-actions" style={{
                                        fontSize: "18px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                    }}
                                    >
                                        <span>Ảnh đại diện</span>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            style={{display: 'none'}}
                                            accept="image/png, image/jpeg, image/gif"
                                        />
                                        <Button
                                            variant="link"
                                            className="p-0 change-photo-btn"
                                            onClick={triggerFileSelect}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Đang tải lên...' : 'Thay ảnh'}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleUpdateRequest}
                                    className="update-btn"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <Spinner as="span" animation="border"
                                                           size="sm"/> : 'Yêu cầu cập nhật tài khoản'}
                                </Button>
                            </div>

                            {activeTab === 'account-info' && (
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Tên người dùng</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={profileData.fullName || ''}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={profileData.userId || ''}
                                                readOnly
                                                className="profile-input readonly"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Vai trò</Form.Label>
                                            <Form.Select
                                                className="profile-input"
                                                value={profileData.roleId || ''}
                                                onChange={(e) => handleInputChange('roleId', e.target.value)}
                                            >
                                                {dropdownData.roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Giới tính</Form.Label>
                                            <Form.Select
                                                value={profileData.gender || ''}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                                className="profile-input"
                                            >
                                                <option value="Male">Nam</option>
                                                <option value="Female">Nữ</option>
                                                <option value="Other">Khác</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Ngày sinh</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={profileData.dob || ''}
                                                onChange={(e) => handleInputChange('dob', e.target.value)}
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={profileData.email || ''}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Số điện thoại</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={profileData.mobilePhone || ''}
                                                onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Chức danh / Mã chức danh</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={`${profileData.role?.name || ''} - ${profileData.jobCode || ''}`}
                                                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Cán bộ quản lý</Form.Label>
                                            <Form.Select
                                                value={profileData.manager}
                                                onChange={(e) => handleInputChange('manager', e.target.value)}
                                                className="profile-input"
                                            >
                                                <option value={profileData.manager}>{profileData.manager}</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Địa điểm</Form.Label>
                                            <Form.Select
                                                value={profileData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                className="profile-input"
                                            >
                                                <option value={profileData.location}>{profileData.location}</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Đơn vị chủ quản</Form.Label>
                                            <Form.Select
                                                value={profileData.parentDepartmentId || ''}
                                                onChange={(e) => handleInputChange('parentDepartmentId', e.target.value)}
                                                className="profile-input"
                                            >
                                                {dropdownData.parentDepartments?.map(item => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Phòng ban 1</Form.Label>
                                            <Form.Select
                                                value={profileData.childDepartment1Id || ''}
                                                onChange={(e) => handleInputChange('childDepartment1Id', e.target.value)}
                                                className="profile-input"
                                                disabled={!profileData.parentDepartmentId}
                                            >
                                                {dropdownData.childDepartments1?.map(item => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="field-label">Phòng ban 2</Form.Label>
                                            <Form.Select
                                                value={profileData.childDepartment2Id || ''}
                                                onChange={(e) => handleInputChange('childDepartment2Id', e.target.value)}
                                                className="profile-input"
                                                disabled={!profileData.childDepartment1Id}
                                            >
                                                {dropdownData.childDepartments2?.map(item => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {activeTab === 'config' && (
                                <div className="text-center py-5">
                                    <h4>Cấu hình tài khoản</h4>
                                    <p className="text-muted">Chức năng đang phát triển...</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;