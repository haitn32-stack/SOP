import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import '../styles/AdminPage.css';

const AdminPage = () => {

    return (
        <Container fluid className="admin-page">
            <Row className="mb-4">
                <Col>
                    <h2 className="page-header">Trang Quản Trị</h2>
                    <p className="page-description">Tổng quan hệ thống quản lý</p>
                </Col>
            </Row>

            {/*<Row>*/}
            {/*    {adminCards.map((card, index) => (*/}
            {/*        <Col key={index} md={6} lg={3} className="mb-4">*/}
            {/*            <Card className="admin-card">*/}
            {/*                <Card.Body>*/}
            {/*                    <div className="card-icon-wrapper" style={{backgroundColor: `${card.color}20`}}>*/}
            {/*                        <card.icon style={{color: card.color}} className="card-icon"/>*/}
            {/*                    </div>*/}
            {/*                    <div className="card-content">*/}
            {/*                        <h3 className="card-count">{card.count}</h3>*/}
            {/*                        <p className="card-title">{card.title}</p>*/}
            {/*                        <p className="card-description">{card.description}</p>*/}
            {/*                    </div>*/}
            {/*                </Card.Body>*/}
            {/*            </Card>*/}
            {/*        </Col>*/}
            {/*    ))}*/}
            {/*</Row>*/}
        </Container>
    );
};

export default AdminPage;
