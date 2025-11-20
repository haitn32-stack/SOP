import React, {useEffect, useState} from 'react';
import {Button, Col, Form, Modal, Row, Spinner} from 'react-bootstrap';
import {instance} from '../../utils/axios';
import {getAllRoles} from '../../services/roleService';
import {FaCalendarAlt, FaUserCircle} from 'react-icons/fa';
import {getAllLocations} from "../../services/locationService.js";
import {getDepartments} from "../../services/departmentService.js";
import '../../styles/UserProfileModal.css'
import {getAllSupervisorUser} from "../../services/userService.js";
import {DatePicker} from "antd";
import dayjs from "dayjs";

// Hàm validate
const validateField = (name, value) => {
    if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex email chung
        if (value && !emailRegex.test(value)) {
            return 'Email không đúng định dạng';
        }
    }
    if (name === 'mobilePhone') {
        const phoneRegex = /^[0-9]{10}$/; // Regex SĐT 10 số
        if (value && !phoneRegex.test(value)) {
            return 'Số điện thoại không đúng định dạng';
        }
    }
    return null; // Hợp lệ
};

const UserProfileModal = ({show, handleClose, userId, setAlert}) => {
    const [formData, setFormData] = useState(null);
    const [dropdownData, setDropdownData] = useState({
        roles: [],
        locations: [],
        supervisors: [],
        parentDepartments: [],
        childDepartments1: [],
        childDepartments2: [],
    });
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Tải dữ liệu user và dropdown
    useEffect(() => {
        if (show && userId) {
            const fetchCoreData = async () => {
                setLoading(true);
                setValidationErrors({});
                try {
                    // Gọi API song song
                    const [userRes, rolesRes, locationsRes, parentDeptsRes] = await Promise.all([
                        instance.get(`/admin/users/${userId}`),
                        getAllRoles(),
                        getAllLocations(),
                        getDepartments()
                    ]);

                    // Xử lý User
                    const sanitizedData = {...userRes.data.user};
                    Object.keys(sanitizedData).forEach(key => {
                        if (sanitizedData[key] === null) sanitizedData[key] = '';
                    });
                    setFormData(sanitizedData);

                    // Xử lý dropdowns
                    setDropdownData(prev => ({
                        ...prev,
                        roles: rolesRes,
                        locations: locationsRes,
                        parentDepartments: parentDeptsRes
                    }));

                } catch (err) {
                    const errorMsg = err.response?.data?.error || err.message || "Không thể tải thông tin.";
                    setAlert({
                        show: true,
                        message: errorMsg,
                        type: 'error'
                    })
                } finally {
                    setLoading(false);
                }
            };
            fetchCoreData();
        }
    }, [show, userId]);

    // Tải supervisor list phụ thuộc (chạy sau khi có formData)
    useEffect(() => {
        const fetchSupervisors = async () => {
            // Chỉ chạy khi có formData VÀ có parentDepartmentId
            if (formData && formData.parentDepartmentId) {
                try {
                    const supervisorRes = await getAllSupervisorUser(formData.parentDepartmentId);
                    setDropdownData(prev => ({...prev, supervisors: supervisorRes}));
                } catch (err) {
                    console.error(err);
                    setDropdownData(prev => ({...prev, supervisors: []}));
                }
            } else {
                setDropdownData(prev => ({...prev, supervisors: []}));
            }
        };
        fetchSupervisors();
    }, [formData]);

    // Tải child dept 1
    useEffect(() => {
        const fetchChildDept1 = async () => {
            if (formData?.parentDepartmentId) {
                try {
                    const data = await getDepartments(formData.parentDepartmentId);
                    setDropdownData(prev => ({...prev, childDepartments1: data}));
                } catch (error) {
                    console.error(error);
                }
            } else {
                setDropdownData(prev => ({...prev, childDepartments1: [], childDepartments2: []}));
            }
        };
        fetchChildDept1();
    }, [formData?.parentDepartmentId]);

    // Tải child dept 2
    useEffect(() => {
        const fetchChildDept2 = async () => {
            if (formData?.childDepartment1Id) {
                try {
                    const data = await getDepartments(formData.childDepartment1Id);
                    setDropdownData(prev => ({...prev, childDepartments2: data}));
                } catch (error) {
                    console.error(error);
                }
            } else {
                setDropdownData(prev => ({...prev, childDepartments2: []}));
            }
        };
        fetchChildDept2();
    }, [formData?.childDepartment1Id]);

    // Xử lý khi admin thay đổi input
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));

        // Xóa lỗi validation khi người dùng bắt đầu sửa
        if (validationErrors[name]) {
            setValidationErrors(prev => ({...prev, [name]: null}));
        }

        // Logic reset dropdown con
        if (name === 'parentDepartmentId') {
            setFormData(prev => ({...prev, childDepartment1Id: '', childDepartment2Id: ''}));
        }
        if (name === 'childDepartment1Id') {
            setFormData(prev => ({...prev, childDepartment2Id: ''}));
        }
    };

    const handleDateChange = (date) => {
        // Chuyển đổi về string YYYY-MM-DD để lưu vào state
        const dateString = date ? date.format('YYYY-MM-DD') : '';
        setFormData(prev => ({
            ...prev,
            dob: dateString
        }));
    };

    // Xử lý khi nhấn nút Cập nhật
    const handleSubmit = async () => {
        const emailError = validateField('email', formData.email);
        const phoneError = validateField('mobilePhone', formData.mobilePhone);

        if (emailError || phoneError) {
            setValidationErrors({email: emailError, mobilePhone: phoneError});
            return;
        }

        setIsUpdating(true);
        try {
            // Chuyển đổi giá trị rỗng '' thành null trước khi gửi
            const payload = {...formData};
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') {
                    payload[key] = null;
                }
            });

            await instance.put(`/admin/users/${userId}`, payload);

            handleClose(true);
        } catch (err) {
            console.error("Failed to update user:", err);
            const errorMessage = (err.response?.data?.error || "Cập nhật tài khoản thất bại.");

            setAlert({
                show: true,
                message: errorMessage,
                type: 'error'
            })
        } finally {
            setIsUpdating(false);
        }
    };

    const onModalHide = () => {
        setFormData(null); // Xóa data cũ
        handleClose(false); // Đóng modal (không refresh)
    };

    const renderModalContent = () => {
        if (loading) {
            return <div className="text-center p-5"><Spinner animation="border"/></div>;
        }

        if (!formData) return null;

        const jobDisplay = [formData.jobTitle, formData.jobCode].filter(Boolean).join(' - ');

        return (
            <>
                <Modal.Body>
                    <Form noValidate>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Tên người dùng</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName || ''}
                                        onChange={handleInputChange}
                                        placeholder="Không có thông tin"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>ID</Form.Label>
                                    <Form.Control type="text" value={formData.userId || ''} readOnly disabled/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Vai trò</Form.Label>
                                    <Form.Select
                                        name="roleId"
                                        value={formData.roleId || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Không có thông tin</option>
                                        {dropdownData.roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Giới tính</Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Không có thông tin</option>
                                        <option value="Male">Nam</option>
                                        <option value="Female">Nữ</option>
                                        <option value="Other">Khác</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Ngày sinh</Form.Label>
                                    <div className="date-input-wrapper">
                                        <FaCalendarAlt className="date-input-icon"/>
                                        <DatePicker
                                            name="dob"
                                            value={formData.dob ? dayjs(formData.dob, 'YYYY-MM-DD') : null}
                                            onChange={handleDateChange}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày"
                                            getPopupContainer={(trigger) => trigger.parentNode}
                                            styles={{popup: {root: {zIndex: 2000}}}}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        isInvalid={!!validationErrors.email}
                                        placeholder="Không có thông tin"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobilePhone"
                                        value={formData.mobilePhone || ''}
                                        onChange={handleInputChange}
                                        isInvalid={!!validationErrors.mobilePhone}
                                        placeholder="Không có thông tin"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.mobilePhone}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Chức danh / Mã chức danh</Form.Label>
                                    <Form.Control type="text" value={jobDisplay}
                                                  placeholder="Không có thông tin"
                                                  readOnly
                                                  disabled/>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Cán bộ quản lý</Form.Label>
                                    <Form.Select
                                        name="supervisorId"
                                        value={formData.supervisorId || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Không có thông tin</option>
                                        {dropdownData.supervisors.map(user => (
                                            <option key={user.userId} value={user.userId}>{user.fullName}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Địa điểm</Form.Label>
                                    <Form.Select
                                        name="locationId"
                                        value={formData.locationId || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Không có thông tin</option>
                                        {dropdownData.locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Đơn vị chủ quản</Form.Label>
                                    <Form.Select
                                        name="parentDepartmentId"
                                        value={formData.parentDepartmentId || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Không có thông tin</option>
                                        {dropdownData.parentDepartments.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Phòng ban 1</Form.Label>
                                    <Form.Select
                                        name="childDepartment1Id"
                                        value={formData.childDepartment1Id || ''}
                                        onChange={handleInputChange}
                                        disabled={!formData.parentDepartmentId}
                                    >
                                        <option value="">Không có thông tin</option>
                                        {dropdownData.childDepartments1.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-1">
                                    <Form.Label>Phòng ban 2</Form.Label>
                                    <Form.Select
                                        name="childDepartment2Id"
                                        value={formData.childDepartment2Id || ''}
                                        onChange={handleInputChange}
                                        disabled={!formData.childDepartment1Id}
                                    >
                                        <option value="">Không có thông tin</option>
                                        {dropdownData.childDepartments2.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        style={{minWidth: '158px', height: '45px'}}
                    >
                        {isUpdating ? <Spinner as="span" size="sm"/> : 'Cập nhật tài khoản'}
                    </Button>
                </Modal.Footer>
            </>
        );
    };

    return (
        <Modal
            show={show}
            onHide={onModalHide}
            dialogClassName="admin-user-profile-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <FaUserCircle size={24}/>
                    {loading ? 'Đang tải...' : (formData?.fullName || 'Thông tin người dùng')}
                </Modal.Title>
            </Modal.Header>
            {renderModalContent()}
        </Modal>
    );
};

export default UserProfileModal;