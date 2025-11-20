import React, {createContext, useContext, useState} from 'react';
import PropTypes from "prop-types";

const AppContext = createContext();

export const AppProvider = ({children}) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <AppContext.Provider value={{
            // Data
            // State
            loading, setLoading,
            error, setError,

            // Functions
            // loadData
        }}>
            {children}
        </AppContext.Provider>
    );
};

AppProvider.propTypes = {children: PropTypes.node.isRequired}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

export default AppProvider;