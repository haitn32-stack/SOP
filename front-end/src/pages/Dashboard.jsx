import React from 'react';
import {useAuth} from "../services/AuthHandler.jsx";
import Alert from "../common/Alert.jsx"
import {Container} from "react-bootstrap";
import Layout from "../common/Layout";

const Dashboard = () => {
    const {user, loading} = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Bạn cần đăng nhập để truy cập trang này.
                </Alert>
            </Container>
        );
    }

    return (
        <Layout showSubHeader={true}>
            <p>Chào mừng đến với Sale Online Platform</p>
        </Layout>
    );
}

export default Dashboard;