import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import '../styles/Breadcrumb.css';

const BreadcrumbComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const generateBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter(x => x);

        if (pathnames.length === 0) {
            return [{name: 'Trang chủ', path: '/'}];
        }

        return pathnames.map((name, index) => {
            const path = `/${pathnames.slice(0, index + 1).join('/')}`;
            let displayName = name.charAt(0).toUpperCase() + name.slice(1);

            // Custom names for specific paths
            if (name === 'profile') displayName = 'Thông tin tài khoản';
            if (name === 'admin') displayName = 'Quản lý người dùng';
            if (name === 'users') displayName = 'Quản lý user';

            return {name: displayName, path};
        });
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <div className="breadcrumb-component">
            {breadcrumbs?.map((crumb, index) => (
                <React.Fragment key={index}>
          <span
              className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : 'clickable'}`}
              onClick={() => index < breadcrumbs.length - 1 && navigate(crumb.path)}
          >
            {crumb.name}
          </span>
                    {index < breadcrumbs.length - 1 && (
                        <span className="breadcrumb-separator">›</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default BreadcrumbComponent;