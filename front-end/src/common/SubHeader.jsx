import React from 'react';
import {useLocation} from 'react-router-dom';
import '../styles/SubHeader.css';

const SubHeader = ({sidebarWidth = 260}) => {
    const location = useLocation();

    const getPageTitle = () => {
        const pathnames = location.pathname.split('/').filter(x => x);

        if (pathnames.length === 0) {
            return 'Trang chủ';
        }

        const lastPath = pathnames[pathnames.length - 1];

        // Custom page titles
        const pageTitles = {
            'profile': 'Tài khoản',
            'admin': 'Trang quản trị',
            'users': 'Quản lý user'
        };

        return pageTitles[lastPath] || lastPath.charAt(0).toUpperCase() + lastPath.slice(1);
    };

    return (
        <div className="sub-header" style={{paddingLeft: sidebarWidth}}>
            <div className="sub-header-content">
                <h2 className="page-title">{getPageTitle()}</h2>
            </div>
        </div>
    );
};

export default SubHeader;