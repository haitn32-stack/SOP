import React, {useEffect, useState} from 'react';
import {Button, Col, Form, Modal, Row, Spinner} from 'react-bootstrap';
import {FaCalendarAlt, FaUserPlus} from 'react-icons/fa';
import {getAllRoles} from '../../services/roleService';
import '../../styles/UserCreationModal.css';
import {instance} from "../../utils/axios.js";
import dayjs from "dayjs";
import {DatePicker} from "antd";

const UserCreationModal = ({show, handleClose, setAlert}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobilePhone: '',
        roleId: '',
        gender: '',
        dob: ''
    });
    const [dropdownData, setDropdownData] = useState({roles: []});
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [errors, setErrors] = useState({});

    // Tải dữ liệu Roles khi modal mở
    useEffect(() => {
        if (show) {
            const fetchRoles = async () => {
                setLoadingRoles(true);
                try {
                    const rolesRes = await getAllRoles();
                    setDropdownData({roles: rolesRes});
                } catch (err) {
                    setErrors({api: "Không thể tải danh sách vai trò."});
                } finally {
                    setLoadingRoles(false);
                }
            };
            fetchRoles();
        }
    }, [show]);

    // Xử lý nhập liệu
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    // Xử lý logic nghiệp vụ cho Datepicker
    const handleDateChange = (date) => {
        let finalDate = date;
        const today = getToday();

        if (date && date.isAfter(today, 'day')) {
            finalDate = today;
        }

        const dateString = finalDate ? finalDate.format('YYYY-MM-DD') : '';

        setFormData(prev => ({
            ...prev,
            dob: dateString
        }));
    };

    // Validate Form phía Frontend
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email không được để trống";
        } else if (!formData.email.endsWith('@fpt.com')) {
            newErrors.email = "Email không đúng định dạng";
        }

        if (!formData.fullName) newErrors.fullName = "Tên người dùng không được để trống";
        if (!formData.roleId) newErrors.roleId = "Vai trò không được để trống";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý Submit
    const handleSubmit = async () => {
        setErrors({});
        if (!validateForm()) {
            return;
        }

        setIsCreating(true);
        try {
            const response = await instance.post('/admin/users/create', formData);

            console.log("Đang gửi dữ liệu:", formData);
            await new Promise(resolve => setTimeout(resolve, 1000));

            handleClose(true);

        } catch (err) {
            let errorMessage = "Tạo tài khoản thất bại.";
            if (err.response?.data?.message?.includes("Email đã tồn tại")) {
                errorMessage = "Email đã tồn tại trong hệ thống.";
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }

            setAlert({
                show: true,
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setIsCreating(false);
        }
    };

    // Reset form khi đóng modal
    const onModalHide = () => {
        setFormData({
            fullName: '', email: '', mobilePhone: '',
            roleId: '', gender: '', dob: ''
        });
        setErrors({});
        handleClose(false);
    };

    const getToday = () => {
        return dayjs();
    };

    const renderModalContent = () => {
        if (loadingRoles) {
            return <div className="text-center p-5"><Spinner animation="border"/></div>;
        }

        return (
            <>
                <Modal.Body>
                    <Form noValidate>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Tên người dùng</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Tên người dùng"
                                        isInvalid={!!errors.fullName}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>ID</Form.Label>
                                    <Form.Control type="text" placeholder="ID" readOnly disabled/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Vai trò</Form.Label>
                                    <Form.Select
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.roleId}
                                    >
                                        <option value="">Chọn vai trò</option>
                                        {dropdownData.roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Giới tính</Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Male">Nam</option>
                                        <option value="Female">Nữ</option>
                                        <option value="Other">Khác</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Ngày sinh</Form.Label>
                                    <div className="date-input-wrapper">
                                        <FaCalendarAlt className="date-input-icon"/>
                                        <DatePicker
                                            name="dob"
                                            value={formData.dob ? dayjs(formData.dob, 'YYYY-MM-DD') : null}
                                            onChange={handleDateChange}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày"
                                            maxDate={getToday()}
                                            getPopupContainer={(trigger) => trigger.parentNode}
                                            styles={{popup: {root: {zIndex: 2000}}}}
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.email}
                                        placeholder="Email"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobilePhone"
                                        value={formData.mobilePhone}
                                        onChange={handleInputChange}
                                        placeholder="Số điện thoại"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isCreating}
                        style={{minWidth: '158px', height: '45px'}}
                    >
                        {isCreating ? <Spinner as="span" size="sm"/> : 'Tạo tài khoản'}
                    </Button>
                </Modal.Footer>
            </>
        );
    };

    return (
        <Modal
            show={show}
            onHide={onModalHide}
            dialogClassName="user-creation-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <FaUserPlus size={20}/>
                    Thêm user
                </Modal.Title>
            </Modal.Header>
            {renderModalContent()}
        </Modal>
    );
};

export default UserCreationModal;