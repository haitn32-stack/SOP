import React, {useState} from 'react';
import Header from './/Header';
import Sidebar from './/Sidebar';
import SubHeader from './/SubHeader';

const Layout = ({children, showSubHeader = true}) => {
    const [sidebarWidth, setSidebarWidth] = useState(260);

    return (
        <div>
            <Header sidebarWidth={sidebarWidth}/>
            <Sidebar onWidthChange={setSidebarWidth}/>
            {showSubHeader && <SubHeader sidebarWidth={sidebarWidth}/>}
            <main
                style={{
                    marginLeft: sidebarWidth,
                    marginTop: showSubHeader ? '110px' : '60px',
                    minHeight: showSubHeader ? 'calc(100vh - 110px)' : 'calc(100vh - 60px)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'margin-left 0.3s ease'
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;