import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkTestCode } from '../api/apiUser';
import { getAllTestUser, randomTest } from '../api/apiTest';
import '../styles/User.css';
import { checkSession } from "../utils/checkSession";
import { AppData } from "../Root";

const User = () => {
    const navigate = useNavigate();
    const { userData, showToast, setType, setMessage } = useContext(AppData);
    const [tests, setTests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [testKey, setTestKey] = useState('');

    const fetchTests = async () => {
        try {
            const data = await getAllTestUser();
            setTests(data);
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        if (!checkSession()) {
            navigate("/");
        }
    }, []);

    const openTestKeyModal = async (test) => {
        try {
            const response = await checkTestCode(userData.username, test.testId);
            if (response.status == 200) {
                navigate(`test/${test.testId}`);
            } else if (response.status == 404) {
                setType("toast-error");
                setMessage("Test is overdue");
                showToast();
            } else {
                setSelectedTest(test);
                setIsModalOpen(true);
                setTestKey('');
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    const handleTestKeySubmit = async () => {
        try {
            const response = await randomTest(userData.username, selectedTest.testId, testKey);
            const data = await response.json();

            if (response.ok) {
                navigate(`test/${selectedTest.testId}`);
            } else {
                setType("toast-error");
                setMessage(data.message || "Invalid Test Key");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    return (
        <div className="user-test-list-container">
            <h2>Upcoming Tests</h2>
            <ul className="test-list">
                {tests.map((test) => (
                    <li key={test.testId} className="test-item" onClick={() => openTestKeyModal(test)}>
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Enter Test Key</h3>
                        <input
                            className='modal-input'
                            type="text"
                            value={testKey}
                            onChange={(e) => setTestKey(e.target.value)}
                            placeholder="Enter Test Key"
                        />
                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)} className="close-btn">Cancel</button>
                            <button onClick={handleTestKeySubmit} className="submit-btn">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default User;
