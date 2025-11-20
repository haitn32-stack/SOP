import React, {useEffect, useState} from 'react';
import {
    FaChartBar,
    FaChevronRight,
    FaCog,
    FaComments,
    FaFileAlt,
    FaGlobe,
    FaHome,
    FaShoppingCart,
    FaUser,
    FaUsers
} from 'react-icons/fa';
import {Form} from 'react-bootstrap';
import {useLocation, useNavigate} from 'react-router-dom';
import '../styles/Sidebar.css';
import {useSelector} from "react-redux";
import {selectCurrentUser} from "../features/auth/authSlice.js";

const Sidebar = ({onWidthChange}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const isAdmin = user?.role?.name === 'Admin';

    const [isAdminMode, setIsAdminMode] = useState(location.pathname.startsWith('/admin'));
    const [expandedMenus, setExpandedMenus] = useState([]);


    // Detect browser dark mode
    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);

        const handleChange = (e) => {
            setIsDarkMode(e.matches);
        };

        darkModeMediaQuery.addEventListener('change', handleChange);
        return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Auto open menu when the child active
    useEffect(() => {
        const currentMenuItems = isAdminMode ? adminMenuItems : userMenuItems;
        const activeParent = currentMenuItems.find(item =>
            item.hasSubmenu && item.submenu.some(sub => location.pathname.startsWith(sub.path))
        );

        if (activeParent && !expandedMenus.includes(activeParent.id)) {
            setExpandedMenus([activeParent.id]);
        }
    }, [location.pathname, isAdminMode]);

    // Notify parent about width changes
    useEffect(() => {
        if (onWidthChange) {
            onWidthChange(isCollapsed ? 60 : 260);
        }
    }, [isCollapsed, onWidthChange]);


    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleToggleSwitch = () => {
        const newIsAdminMode = !isAdminMode;
        setIsAdminMode(newIsAdminMode);

        if (newIsAdminMode) {
            navigate('/admin/users');
        } else {
            navigate('/dashboard');
        }
    };

    const toggleMenu = (menuName) => {
        if (expandedMenus.includes(menuName)) {
            setExpandedMenus(expandedMenus.filter(m => m !== menuName));
        } else {
            setExpandedMenus([...expandedMenus, menuName]);
        }
    };

    const adminMenuItems = [
        {
            id: 'user-management',
            label: 'Quản lý người dùng',
            icon: FaUsers,
            hasSubmenu: true,
            submenu: [
                {label: 'Quản lý user', icon: FaUser, path: '/admin/users'},
                {label: 'Quản lý vai trò', icon: FaUsers, path: '/admin/roles'}
            ]
        },
        {id: 'multi-site', label: 'Quản lý multi site', icon: FaGlobe, path: '/admin/multisite'},
        {id: 'customer', label: 'Quản lý khách hàng', icon: FaShoppingCart, path: '/admin/customers'},
        {id: 'report', label: 'Báo cáo tổng', icon: FaChartBar, path: '/admin/reports'}
    ];

    const userMenuItems = [
        {id: 'home', label: 'Trang chủ', icon: FaHome, path: '/dashboard'},
        {
            id: 'chat',
            label: 'Chat đa kênh',
            icon: FaComments,
            hasSubmenu: true,
            submenu: [
                {label: 'Chat Facebook', icon: FaComments, path: '/chat/facebook'},
                {label: 'Chat Zalo', icon: FaComments, path: '/chat/zalo'}
            ]
        },
        {id: 'website-setup', label: 'Thiết lập website', icon: FaCog, path: '/website-setup'},
        {
            id: 'customer-management',
            label: 'Quản lý khách hàng',
            icon: FaShoppingCart,
            hasSubmenu: true,
            submenu: [
                {label: 'Danh sách khách hàng', icon: FaUser, path: '/customers/list'},
                {label: 'Nhóm', icon: FaUsers, path: '/customers/categories'}
            ]
        },
        {id: 'report-user', label: 'Báo cáo', icon: FaFileAlt, path: '/reports'},
        {id: 'config', label: 'Cấu hình hệ thống', icon: FaCog, path: '/config'}
    ];

    const currentMenuItems = isAdminMode ? adminMenuItems : userMenuItems;

    const handleMenuClick = (item) => {
        if (item.hasSubmenu) {
            toggleMenu(item.id);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    const isMenuItemActive = (item) => {
        if (item.path && location.pathname === item.path) {
            return true;
        }
        return false;
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="sidebar-content">
                {/* Main menu items */}
                <div className="sidebar-menu">
                    {currentMenuItems.map((item) => (
                        <div key={item.id}>
                            <div
                                className={`menu-item ${isMenuItemActive(item) ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item)}
                            >
                                <item.icon className="menu-icon"/>
                                {!isCollapsed && (
                                    <>
                                        <span className="menu-text">{item.label}</span>
                                        {item.hasSubmenu && (
                                            <FaChevronRight
                                                className={`submenu-arrow ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                            {!isCollapsed && item.hasSubmenu && expandedMenus.includes(item.id) && (
                                <div className="submenu">
                                    {item.submenu.map((subItem, idx) => (
                                        <div
                                            key={idx}
                                            className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                                            onClick={() => navigate(subItem.path)}
                                        >
                                            <subItem.icon className="menu-icon"/>
                                            <span className="menu-text">{subItem.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom section */}
                <div className="sidebar-bottom">
                    {/* Toggle Switch if user is Admin */}
                    {isAdmin && (
                        <div className="toggle-container">
                            {!isCollapsed && <span className="toggle-label">Trang quản trị</span>}
                            <Form.Check
                                type="switch"
                                id="page-switch"
                                checked={isAdminMode}
                                onChange={handleToggleSwitch}
                                className="page-switch"
                            />
                        </div>
                    )}

                    {/* Collapse button */}
                    <div className="collapse-button" onClick={toggleSidebar}>
                        {isCollapsed ? (
                            <FaChevronRight className="collapse-icon"/>
                        ) : (
                            <>
                                <FaHome className="collapse-icon"/>
                                <span className="collapse-text">Thu gọn</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;