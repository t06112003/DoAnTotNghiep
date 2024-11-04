import React, { useEffect, useState } from 'react';
import { getAllTestUser } from '../api/apiTest';
import '../styles/User.css';

const User = () => {
    const [tests, setTests] = useState([]);
    const [error, setError] = useState(null);

    const fetchTests = async () => {
        try {
            const data = await getAllTestUser();
            setTests(data);
        } catch (error) {
            setError("1112312");
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    return (
        <div className="user-test-list-container">
            <h2>Upcoming Tests</h2>
            {error && <p className="error-message">{error}</p>}
            <ul className="test-list">
                {tests.map((test) => (
                    <li key={test.testId} className="test-item">
                        <div className="test-details">
                            <span className="test-name">{test.testName}</span>
                            <span className="test-date">
                                {new Date(test.beginDate).toLocaleDateString()} - {new Date(test.endDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="test-info">
                            <span className="test-time">Duration: {test.testTime}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default User;
