import React, {useEffect} from 'react';
import {FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle} from 'react-icons/fa';
import PropTypes from "prop-types";

const Alert = ({
                   message, type = 'success', onClose, show, title, description,
                   className = '', duration = 5000
               }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer); // Clear timeout nếu component unmount hoặc show thay đổi
        }
    }, [show, duration, onClose]);

    if (!show || !message) return null;

    const getAlertStyles = (type) => {
        switch (type) {
            case 'success':
                return {
                    background: '#EBF4EC',
                    border: '1px solid #EBF4EC',
                    boxShadow: 'inset 4px 0px 0px #0A901B',
                    iconColor: '#3A9F09',
                    textColor: '#3A9F09'
                };
            case 'error':
            case 'danger':
                return {
                    background: '#FDEBEE',
                    border: '1px solid #FDEBEE',
                    boxShadow: 'inset 4px 0px 0px #DC2626',
                    iconColor: '#DC2626',
                    textColor: '#DC2626'
                };
            case 'warning':
                return {
                    background: '#FFF8E1',
                    border: '1px solid #FFF8E1',
                    boxShadow: 'inset 4px 0px 0px #F59E0B',
                    iconColor: '#F59E0B',
                    textColor: '#F59E0B'
                };
            case 'info':
                return {
                    background: '#E1F5FE',
                    border: '1px solid #E1F5FE',
                    boxShadow: 'inset 4px 0px 0px #0284C7',
                    iconColor: '#0284C7',
                    textColor: '#0284C7'
                };
            default:
                return {
                    background: '#EBF4EC',
                    border: '1px solid #EBF4EC',
                    boxShadow: 'inset 4px 0px 0px #0A901B',
                    iconColor: '#3A9F09',
                    textColor: '#3A9F09'
                };
        }
    };

    const getAlertIcon = (type, iconColor) => {
        const iconProps = {
            size: 20,
            style: {color: iconColor}
        };

        switch (type) {
            case 'success':
                return <FaCheckCircle {...iconProps} />;
            case 'error':
            case 'danger':
                return <FaTimesCircle {...iconProps} />;
            case 'warning':
                return <FaExclamationTriangle {...iconProps} />;
            case 'info':
                return <FaInfoCircle {...iconProps} />;
            default:
                return <FaCheckCircle {...iconProps} />;
        }
    };

    const styles = getAlertStyles(type);

    return (
        <div
            role="alert"
            className={`alert-custom ${className}`}
            style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                padding: '16px',
                gap: '12px',
                position: 'fixed',
                width: '686px',
                minHeight: '56px',
                left: '50%',
                top: '24px',
                transform: 'translateX(-50%)',
                background: styles.background,
                border: styles.border,
                boxShadow: styles.boxShadow,
                borderRadius: '0px 4px 4px 0px',
                zIndex: 1050,
                animation: 'slideDown 0.4s ease-out forwards',
                maxWidth: '90%'
            }}
        >
            {/* Icon */}
            <div
                style={{
                    width: '24px',
                    height: '24px',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {getAlertIcon(type, styles.iconColor)}
            </div>

            {/* Content Wrapper */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0px',
                    gap: '4px',
                    flex: 'none',
                    order: 1,
                    flexGrow: 1,
                    width: '100%'
                }}
            >
                {/* Title */}
                <div
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        fontSize: '14px',
                        lineHeight: '150%',
                        color: styles.textColor,
                        flex: 'none',
                        order: 0,
                        alignSelf: 'stretch',
                        flexGrow: 0,
                        width: '100%'
                    }}
                >
                    {title || message}
                </div>

                {/* Description */}
                {description && (
                    <div
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '150%',
                            color: styles.textColor,
                            flex: 'none',
                            order: 1,
                            alignSelf: 'stretch',
                            flexGrow: 0,
                            width: '100%'
                        }}
                    >
                        {description}
                    </div>
                )}
            </div>

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        width: '16px',
                        height: '16px',
                        flex: 'none',
                        order: 2,
                        flexGrow: 0,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: styles.iconColor,
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                >
                    <FaTimes size={12}/>
                </button>
            )}
        </div>
    );
};

const AlertTitle = React.forwardRef(({className, children, ...props}, ref) => (
    <div
        ref={ref}
        className={`font-bold text-sm leading-none tracking-tight ${className || ''}`}
        {...props}
    >
        {children}
    </div>
));
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({className, children, ...props}, ref) => (
    <div
        ref={ref}
        className={`text-sm opacity-90 ${className || ''}`}
        {...props}
    >
        {children}
    </div>
));
AlertDescription.displayName = "AlertDescription"

export default Alert;

Alert.propTypes = {children: PropTypes.node.isRequired,}

export {AlertTitle, AlertDescription};