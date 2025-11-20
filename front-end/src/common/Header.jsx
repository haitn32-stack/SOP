import React from 'react';
import {FaChevronDown, FaInfinity, FaUser} from 'react-icons/fa';
import {IoIosNotificationsOutline} from "react-icons/io";
import {Dropdown, Image} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import BreadcrumbComponent from './/Breadcrumb';
import '../styles/Header.css';
import {useDispatch, useSelector} from "react-redux";
import {logout as logoutAction, selectCurrentUser} from '../features/auth/authSlice';


const Header = ({sidebarWidth = 260}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleLogoutClick = () => {
        dispatch(logoutAction()); // <-- Dispatch action logout
        navigate('/');
    };

    return (
        <div className="header-container">
            <div className="header-content">
                {/* Left section - Logo */}
                <div className="header-left"
                     style={{width: sidebarWidth, transition: 'width 0.3s ease', justifyContent: 'center'}}
                >
                    <FaInfinity className="header-logo"/>
                    <div className="header-title">
                        <span>SALE</span>
                        <span>PLATFORM</span>
                    </div>
                </div>

                {/* Middle section - Breadcrumb */}
                <div className="header-middle">
                    <BreadcrumbComponent/>
                </div>

                {/* Right section - Notifications & User */}
                <div className="header-right">
                    <div className="notification-icon">
                        <IoIosNotificationsOutline/>
                    </div>

                    <div className="user-section">
                        <div className="user-avatar">
                            {user?.avatar ? (
                                <Image src={user.avatar} roundedCircle className="user-avatar"/>
                            ) : (
                                <FaUser/>
                            )}
                        </div>
                        <span className="username">{user?.fullName || user?.userName || 'User'}</span>

                        <Dropdown align="end">
                            <Dropdown.Toggle
                                variant="link"
                                id="user-dropdown"
                                className="user-dropdown-toggle"
                            >
                                <FaChevronDown/>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="user-dropdown-menu">
                                <Dropdown.Item onClick={handleProfileClick}>
                                    <FaUser className="dropdown-icon"/>
                                    Thông tin tài khoản
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleLogoutClick} className="logout-item">
                                    Đăng xuất
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;