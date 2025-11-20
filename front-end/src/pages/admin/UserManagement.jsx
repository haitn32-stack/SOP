import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Container, Dropdown, Form, InputGroup, Pagination, Spinner, Table} from 'react-bootstrap';
import {
    FaDownload,
    FaFilter,
    FaSearch,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTable,
    FaTh,
    FaTimes,
    FaUpload
} from 'react-icons/fa';
import {instance} from '../../utils/axios.js';
import '../../styles/UserManagement.css';
import UserProfileModal from "./UserProfileModal.jsx";
import Alert from "../../common/Alert.jsx";
import UserCreationModal from "./UserCreationModal.jsx";
import {getAllRoles} from "../../services/roleService.js";
import {getDepartments} from "../../services/departmentService.js";
import {Badge} from "antd";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertState, setAlertState] = useState({
        show: false,
        message: '',
        type: 'error'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    const [sortConfig, setSortConfig] = useState({key: 'createdAt', direction: 'desc'});

    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({
        isActive: '',
        roleId: '',
        locationId: '',
        parentDepartmentId: '',
        childDepartment1Id: '',
        childDepartment2Id: '',
        supervisorId: '',
    });
    const [filterOpts, setFilterOpts] = useState({
        roleId: [],
        locationId: [],
        parentDepartmentId: [],
        childDepartment1Id: [],
        childDepartment2Id: [],
        supervisorId: [],
    })

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [sidebarWidth, setSidebarWidth] = useState(260);

    // const [totalUsers, setTotalUsers] = useState(0);
    const [viewMode, setViewMode] = useState('table');
    const [error, setError] = useState(null);

    // Load data filter khi init
    useEffect(() => {
        const loadFilterOpts = async () => {
            try {
                const [roles, depts] = await Promise.all([getAllRoles(), getDepartments()]);
                setFilterOpts({roles, departments: depts});
            } catch (e) {
                console.log(e);
            }
        };
        loadFilterOpts();
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                page_size: pageSize,
                search: searchTerm || undefined,
                sort: 'createdAt',
                order: 'desc',
                ...filters,
            }

            const response = await instance.get(`/admin/users`, {params});
            setUsers(response.data.users);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            setAlertState({show: true, message: error.message, type: 'error'});
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, sortConfig, filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="text-muted ms-1" size={12}/>;
        return sortConfig.direction === 'asc'
            ? <FaSortUp className="text-primary ms-1" size={12}/>
            : <FaSortDown className="text-primary ms-1" size={12}/>;
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 1) {
            try {
                const res = await instance.get('/admin/users/suggestions', {params: {keyword: value}});
                setSuggestions(res.data.suggestions);
                setShowSuggestions(true);
            } catch (err) {
                console.log(err);
            }
        } else {
            setShowSuggestions(false);
        }
    }

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setShowSuggestions(true);
        setCurrentPage(1);
        await fetchUsers();
    };

    const selectSuggestion = (user) => {
        setSearchTerm(user.fullName);
        setShowSuggestions(true);
        handleViewProfile(user.userId);
    }

    const clearSearch = () => {
        setSearchTerm('');
        setShowSuggestions(false);
        fetchUsers();
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUserIds(users.map(u => u.userId));
        } else {
            setSelectedUserIds([]);
        }
    }

    const handleSelectUser = (userId) => {
        if (selectedUserId.includes(userId)) {
            setSelectedUserIds(selectedUserIds.filter(u => u.userId === userId));
        } else {
            setSelectedUserIds([...selectedUserIds, userId]);
        }
    }

    const handleBulkDeactive = async () => {
        try {
            await instance.get(`/admin/users/bulk-status`, {userIds: selectedUserIds, isActive: false});
            setAlertState({show: true, message: 'Khoá tài khoản thành công', type: 'success'});
            await fetchUsers();
            setSelectedUserId([]);
        } catch (err) {
            setAlertState({show: true, message: 'Khoá tài khoản thất bại', type: 'error'});
        }
    }

    const isAllDeactiveSelected = selectedUserIds.length > 0 && selectedUserIds.every(id => {
        const u = users.find(user => user.userId === id);
        return u && !u.isActive;
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({...filters, [key]: value}));
        setCurrentPage(1);
    }

    const handleResetFilter = () => {
        setFilters({
            isActive: '',
            roleId: '',
            locationId: '',
            parentDepartmentId: '',
            childDepartment1Id: '',
            childDepartment2Id: '',
            supervisorId: ''
        });
    };

    // Listen for sidebar width changes
    useEffect(() => {
        const handleResize = () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const width = sidebar.classList.contains('collapsed') ? 60 : 260;
                setSidebarWidth(width);
            }
        };

        // Initial check
        handleResize();

        // Watch for sidebar changes
        const observer = new MutationObserver(handleResize);
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            observer.observe(sidebar, {attributes: true, attributeFilter: ['class']});
        }

        return () => observer.disconnect();
    }, []);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleViewProfile = (userId) => {
        setSelectedUserId(userId);
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = (isUpdated) => {
        setShowProfileModal(false);
        setSelectedUserId(null);
        if (isUpdated) {
            fetchUsers();
            setAlertState({show: true, message: 'Cập nhật tài khoản thành công!', type: 'success'});
        }
    };

    const handleCloseCreateModal = (isCreated) => {
        setShowCreateModal(false);
        if (isCreated) {
            fetchUsers(); // Tải lại danh sách nếu tạo thành công
            setAlertState({show: true, message: 'Tạo tài khoản thành công!', type: 'success'});
        }
    };

    const renderPagination = () => {
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        return (
            <Pagination className="justify-content-center mt-3">
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}/>
                {items}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)}
                                 disabled={currentPage === totalPages}/>
            </Pagination>
        );
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await instance.put(`/admin/users/${userId}/status`, {isActive: !currentStatus});
            setUsers(users.map(u =>
                u.userId === userId ? {
                    ...u,
                    isActive: !currentStatus,
                    trang_thai: !currentStatus ? 'Kích hoạt' : 'Khoá'
                } : u
            ));

            setAlertState({
                show: true,
                message: 'Cập nhật trạng thái thành công!',
                type: 'success'
            });
        } catch (error) {
            console.error('Failed to update user status:', error);
            setAlertState({
                show: true,
                message: 'Cập nhật trạng thái thất bại. Vui lòng thử lại.',
                type: 'error'
            });
        }
    };

    // Calculate max width based on sidebar
    const containerMaxWidth = sidebarWidth === 260 ? 'calc(100vw - 260px - 40px)' : 'calc(100vw - 60px - 40px)';

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <p className="text-danger">{error}</p>
            </Container>
        );
    }

    return (
        <div className="user-management" style={{maxWidth: containerMaxWidth}}>
            <Alert
                show={alertState.show}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState(prev => ({...prev, show: false}))}
            />

            {/* Action Bar */}
            <div className="action-bar">
                <div className="action-left gap-3">
                    {/* Nút Filter Toggle */}
                    <Button variant={showFilter ? "primary" : "light"} onClick={() => setShowFilter(!showFilter)}>
                        <FaFilter/> <span>Bộ lọc</span>
                    </Button>

                    {/* Search Box với Suggestion */}
                    <Form onSubmit={handleSearchSubmit} className="position-relative" ref={searchRef}>
                        <InputGroup className="search-box">
                            <InputGroup.Text><FaSearch/></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchTerm && (
                                <Button variant="link" className="text-secondary" style={{zIndex: 10}}
                                        onClick={clearSearch}>
                                    <FaTimes/>
                                </Button>
                            )}
                        </InputGroup>

                        {/* Dropdown Gợi ý */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions shadow-sm">
                                {suggestions.map(u => (
                                    <div key={u.userId} className="suggestion-item p-2 border-bottom"
                                         onClick={() => selectSuggestion(u)}
                                         style={{cursor: 'pointer'}}>
                                        <div className="fw-bold">{u.fullName} <small
                                            className="text-muted">({u.mobilePhone})</small></div>
                                        <small className="text-muted">{u.email}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Form>
                </div>

                <div className="action-right">
                    <Button variant="primary" className="action-btn" data-testid="add-user-btn"
                            onClick={() => setShowCreateModal(true)}>
                        <FaUpload/> Thêm user
                    </Button>
                    <Button variant="outline-primary" className="action-btn" data-testid="export-btn">
                        <FaDownload/> Export
                    </Button>
                    <Button variant="outline-primary" className="action-btn" data-testid="import-btn">
                        <FaUpload/> Import
                    </Button>
                    <Button variant="link" className="view-mode-btn" onClick={() => setViewMode('table')}
                            data-testid="view-mode-list-btn">
                        <FaTable/>
                    </Button>
                    <Button variant="link" className="view-mode-btn" onClick={() => setViewMode('grid')}
                            data-testid="view-mode-grid-btn">
                        <FaTh/>
                    </Button>
                </div>
            </div>

            {/* Filter Bar (Hiển thị khi click nút Filter) */}
            {showFilter && (
                <div className="filter-bar p-3 mb-3 bg-white rounded shadow-sm d-flex gap-3 flex-wrap align-items-end">
                    <Form.Group style={{minWidth: '150px'}}>
                        <Form.Label className="small fw-bold">Trạng thái</Form.Label>
                        <Form.Select value={filters.isActive}
                                     onChange={e => handleFilterChange('isActive', e.target.value)}>
                            <option value="">Tất cả</option>
                            <option value="true">Kích hoạt</option>
                            <option value="false">Khoá</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group style={{minWidth: '150px'}}>
                        <Form.Label className="small fw-bold">Vai trò</Form.Label>
                        <Form.Select value={filters.roleId}
                                     onChange={e => handleFilterChange('roleId', e.target.value)}>
                            <option value="">Tất cả</option>
                            {filterOpts.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group style={{minWidth: '150px'}}>
                        <Form.Label className="small fw-bold">Đơn vị</Form.Label>
                        <Form.Select value={filters.parentDepartmentId}
                                     onChange={e => handleFilterChange('parentDepartmentId', e.target.value)}>
                            <option value="">Tất cả</option>
                            {filterOpts.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Button variant="outline-secondary" onClick={handleResetFilter}>Reset</Button>
                </div>
            )}

            {}

            {/* User Table */}
            <div className="table-container">
                {loading ? (
                    <div className="loading-state" data-testid="loading-indicator">Đang tải...</div>
                ) : (
                    <Table hover className="user-table" data-testid="users-table">
                        <thead>
                        <tr>
                            <th style={{width: '40px'}}>
                                <Form.Check
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={users.length > 0 && selectedUserIds.length === users.length}
                                />
                            </th>
                            <th>ID</th>
                            <th onClick={() => handleSort('isActive')} style={{cursor: 'pointer'}}>
                                Trạng thái {getSortIcon('isActive')}
                            </th>
                            <th onClick={() => handleSort('fullName')} style={{cursor: 'pointer'}}>
                                Tên người dùng {getSortIcon('fullName')}
                            </th>
                            <th>Email</th>
                            <th>Giới tính</th>
                            <th>Ngày sinh</th>
                            <th>Số điện thoại</th>
                            <th>Địa điểm</th>
                            <th onClick={() => handleSort('role')} style={{cursor: 'pointer'}}>
                                Vai trò {getSortIcon('role')}
                            </th>
                            <th>Chức danh/Mã chức danh</th>
                            <th>Cán bộ quản lý</th>
                            <th>Email cán bộ quản lý</th>
                            <th onClick={() => handleSort('department')} style={{cursor: 'pointer'}}>
                                Đơn vị chủ quản{getSortIcon('department')}
                            </th>
                            <th>Phòng ban 1</th>
                            <th>Phòng ban 2</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.userId}
                                className={selectedUserIds.includes(user.userId) ? 'table-active' : ''}>
                                <td>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.userId)}
                                        onChange={() => handleSelectUser(user.userId)}
                                    />
                                </td>
                                <td>{user.userId}</td>
                                <td>
                                    {/* Toggle Status Component cũ */}
                                    <div className="status-cell"
                                         onClick={() => handleToggleStatus(user.userId, user.isActive)}>
                                        <div className={`toggle-switch ${user.isActive ? 'active' : ''}`}>
                                            <div className="toggle-slider"></div>
                                        </div>
                                        <span className={`status-text ${user.isActive ? 'active' : 'inactive'}`}>
                                            {user.trang_thai}
                                        </span>
                                    </div>
                                </td>
                                <td className="fw-bold text-primary pointer"
                                    onClick={() => handleViewProfile(user.userId)}>
                                    {user.fullName}
                                </td>
                                <td>{user.email}</td>
                                <td>{user.mobilePhone}</td>
                                <td>{user.locationId}</td>
                                <td><Badge bg="info">{user.vai_tro}</Badge></td>
                                <td>{user.jobTitle} - {user.jobCode}</td>
                                <td>{user.supervisorId}</td>
                                <td>{user.don_vi_chu_quan}</td>
                                <td>{user.childDepartment1Id}</td>
                                <td>{user.childDepartment2Id}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* Pagination */}
            <div className="pagination-container">
                <Pagination data-testid="pagination-controls">{renderPagination()}</Pagination>

                <Dropdown onSelect={(size) => handlePageSizeChange(parseInt(size))}>
                    <Dropdown.Toggle variant="outline-secondary" id="page-size-dropdown"
                                     data-testid="page-size-dropdown">
                        {pageSize} kết quả/trang
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="10">10 data/trang</Dropdown.Item>
                        <Dropdown.Item eventKey="20">20 data/trang</Dropdown.Item>
                        <Dropdown.Item eventKey="50">50 data/trang</Dropdown.Item>
                        <Dropdown.Item eventKey="100">100 data/trang</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            {/* Render Modal */}
            <UserProfileModal
                show={showProfileModal}
                handleClose={handleCloseProfileModal}
                userId={selectedUserId}
                setAlert={setAlertState}
            />

            <UserCreationModal
                show={showCreateModal}
                handleClose={handleCloseCreateModal}
                setAlert={setAlertState}
            />
        </div>
    );
};

export default UserManagement;