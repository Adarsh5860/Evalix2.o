// components/DataTable.js
import React, { useState } from 'react';
import { Table, Form, InputGroup, Badge, Card } from 'react-bootstrap';
import { FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import '../styles/DataTable.scss';

const DataTable = ({ verbs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('verb');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filter and sort verbs
    const filteredVerbs = verbs.filter(item =>
        item.verb.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classification.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classification.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedVerbs = [...filteredVerbs].sort((a, b) => {
        let valA, valB;

        if (sortField === 'verb') {
            valA = a.verb.toLowerCase();
            valB = b.verb.toLowerCase();
        } else if (sortField === 'domain') {
            valA = a.classification.domain.toLowerCase();
            valB = b.classification.domain.toLowerCase();
        } else if (sortField === 'subdomain') {
            valA = a.classification.subdomain.toLowerCase();
            valB = b.classification.subdomain.toLowerCase();
        } else if (sortField === 'confidence') {
            valA = a.classification.confidence;
            valB = b.classification.confidence;
        } else if (sortField === 'frequency') {
            valA = a.frequency || 0;
            valB = b.frequency || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedVerbs.length / itemsPerPage);
    const paginatedVerbs = sortedVerbs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Generate pagination range with ellipses
    const getPaginationRange = () => {
        const delta = 2; // Number of pages to show before and after current page
        const range = [];
        const rangeWithEllipsis = [];
        let l;

        range.push(1);

        if (totalPages <= 1) {
            return range;
        }

        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i > 1 && i < totalPages) {
                range.push(i);
            }
        }

        range.push(totalPages);

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    // If there's just one number between, show it without ellipsis
                    rangeWithEllipsis.push(l + 1);
                } else if (i - l !== 1) {
                    // Add ellipsis marker
                    rangeWithEllipsis.push('...');
                }
            }
            rangeWithEllipsis.push(i);
            l = i;
        }

        return rangeWithEllipsis;
    };

    // Get domain color class
    const getDomainColorClass = (domain) => {
        switch (domain.toLowerCase()) {
            case 'cognitive': return 'primary';
            case 'affective': return 'danger';
            case 'psychomotor': return 'success';
            default: return 'secondary';
        }
    };

    // Get confidence color
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.9) return 'success';
        if (confidence >= 0.75) return 'primary';
        if (confidence >= 0.6) return 'warning';
        return 'danger';
    };

    return (
        <Card className="data-table-card">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Verb Classification Results</h5>
                    <div className="search-container">
                        <InputGroup>
                            <InputGroup.Text><FiSearch /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search verbs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                </div>
            </Card.Header>
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort('verb')}
                                    className={sortField === 'verb' ? 'active-sort' : ''}
                                >
                                    Verb
                                    {sortField === 'verb' && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                                        </span>
                                    )}
                                </th>
                                <th
                                    onClick={() => handleSort('frequency')}
                                    className={`frequency-column ${sortField === 'frequency' ? 'active-sort' : ''}`}
                                >
                                    Frequency
                                    {sortField === 'frequency' && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                                        </span>
                                    )}
                                </th>
                                <th
                                    onClick={() => handleSort('domain')}
                                    className={sortField === 'domain' ? 'active-sort' : ''}
                                >
                                    Domain
                                    {sortField === 'domain' && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                                        </span>
                                    )}
                                </th>
                                <th
                                    onClick={() => handleSort('subdomain')}
                                    className={sortField === 'subdomain' ? 'active-sort' : ''}
                                >
                                    Subdomain
                                    {sortField === 'subdomain' && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                                        </span>
                                    )}
                                </th>
                                <th
                                    onClick={() => handleSort('confidence')}
                                    className={sortField === 'confidence' ? 'active-sort' : ''}
                                >
                                    Confidence
                                    {sortField === 'confidence' && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                                        </span>
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVerbs.length > 0 ? (
                                paginatedVerbs.map((item, index) => (
                                    <tr key={index}>
                                        <td className="verb-cell">{item.verb}</td>
                                        <td className="frequency-cell">
                                            <Badge bg="info" className="frequency-badge">
                                                {item.frequency || 1}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge
                                                bg={getDomainColorClass(item.classification.domain)}
                                                className="domain-badge"
                                            >
                                                {item.classification.domain.charAt(0).toUpperCase() +
                                                    item.classification.domain.slice(1)}
                                            </Badge>
                                        </td>
                                        <td>{item.classification.subdomain.charAt(0).toUpperCase() +
                                            item.classification.subdomain.slice(1)}</td>
                                        <td>
                                            <div className="confidence-bar-container">
                                                <div
                                                    className={`confidence-bar bg-${getConfidenceColor(item.classification.confidence)}`}
                                                    style={{ width: `${Math.round(item.classification.confidence * 100)}%` }}
                                                ></div>
                                                <span className="confidence-text">
                                                    {Math.round(item.classification.confidence * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        No verbs match your search criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>

            {totalPages > 1 && (
                <Card.Footer>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-muted">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVerbs.length)} of {filteredVerbs.length} entries
                            </small>
                        </div>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>

                            {getPaginationRange().map((item, index) => (
                                item === '...' ? (
                                    <li key={`ellipsis-${index}`} className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                ) : (
                                    <li
                                        key={`page-${item}`}
                                        className={`page-item ${currentPage === item ? 'active' : ''}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(item)}
                                        >
                                            {item}
                                        </button>
                                    </li>
                                )
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </div>
                </Card.Footer>
            )}
        </Card>
    );
};

export default DataTable;