import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FiUpload, FiPieChart, FiList, FiInfo } from 'react-icons/fi';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h5 className="sidebar-heading px-3 py-3 mb-0">Analysis Tools</h5>
            <ListGroup variant="flush">
                <ListGroup.Item action className="d-flex align-items-center">
                    <FiUpload className="me-2" />
                    Upload Document
                </ListGroup.Item>
                <ListGroup.Item action className="d-flex align-items-center">
                    <FiPieChart className="me-2" />
                    View Charts
                </ListGroup.Item>
                <ListGroup.Item action className="d-flex align-items-center">
                    <FiList className="me-2" />
                    Verb Classifications
                </ListGroup.Item>
                <ListGroup.Item action className="d-flex align-items-center">
                    <FiInfo className="me-2" />
                    About Analysis
                </ListGroup.Item>
            </ListGroup>

            <h5 className="sidebar-heading px-3 py-3 mt-4 mb-0">Taxonomy Domains</h5>
            <ListGroup variant="flush">
                <ListGroup.Item action>Cognitive</ListGroup.Item>
                <ListGroup.Item action>Affective</ListGroup.Item>
                <ListGroup.Item action>Psychomotor</ListGroup.Item>
            </ListGroup>
        </div>
    );
};

export default Sidebar;