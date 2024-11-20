import { useState, useContext, useEffect } from "react";
import { createTest, getAllTest, editTest, deleteTest } from "../api/apiTest";
import { isAdmin } from "../api/apiUser";
import { useNavigate } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { AppData } from "../Root";
import ConfirmModal from './Shared/ConfirmModal';

import "../styles/Admin.css";

const Admin = () => {
    const navigate = useNavigate();
    const { userData, showToast, setType, setMessage } = useContext(AppData);

    const [createFormData, setCreateFormData] = useState({
        testName: "",
        testKey: "",
        beginDate: "",
        endDate: "",
        testTime: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [testList, setTestList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const testsPerPage = 10;
    const indexOfLastTest = currentPage * testsPerPage;
    const indexOfFirstTest = indexOfLastTest - testsPerPage;
    const currentTests = testList.slice(indexOfFirstTest, indexOfLastTest);

    const nextPage = () => {
        if (currentPage < Math.ceil(testList.length / testsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const fetchTests = async () => {
        try {
            const data = await getAllTest();
            setTestList(data);
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    useEffect(() => {
        fetchTests();
    }, [selectedTest]);

    const handleCreateInputChange = (e) => {
        setCreateFormData({
            ...createFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await createTest(
                userData.username,
                createFormData.testName,
                createFormData.testKey,
                createFormData.beginDate,
                createFormData.testTime,
                createFormData.endDate
            );
            const data = await response.json();
            if (response.ok) {
                setType("toast-success");
                setMessage(data.message);
                showToast();
                setTestList([...testList, createFormData]);
                setCreateFormData("");
                setIsModalOpen(false);
            } else {
                setType("toast-error");
                setMessage(data.message);
                showToast();
            }
        } catch (error) {
            setMessage("Error creating test. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (selectedTest) {
                const response = await editTest(
                    userData.username,
                    selectedTest.testId,
                    selectedTest.testName,
                    selectedTest.testKey,
                    selectedTest.beginDate,
                    selectedTest.testTime,
                    selectedTest.endDate
                );
                const data = await response.json();
                if (response.ok) {
                    setType("toast-success");
                    setMessage(data.message);
                    showToast();
                    setEditModalOpen(false);
                    setSelectedTest(null);
                } else {
                    setType("toast-error");
                    setMessage(data.message);
                    showToast();
                }
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Error edit test. Please try again.");
            showToast();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirmation = (testId) => {
        setSelectedTestId(testId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedTestId) {
            handleDeleteTest(selectedTestId);
        }
        setIsConfirmModalOpen(false);
    };

    const handleDeleteTest = async (testId) => {
        try {
            const response = await deleteTest(userData.username, testId);
            const data = await response.json();
            if (response.ok) {
                setType("toast-success");
                setMessage("Test deleted successfully!");
                showToast();
                fetchTests();
            } else {
                setType("toast-error");
                setMessage(data.message);
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    const checkAdminStatus = async () => {
        if (!checkSession()) {
            navigate("/");
            return;
        }

        try {
            const adminStatus = await isAdmin(userData.username);
            if (adminStatus.status != 200) {
                navigate("/user");
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            navigate("/user");
        }
    };

    useEffect(() => {
        checkAdminStatus();
    }, []);

    return (
        <div className="admin-cms-container">
            <h2>Admin CMS - Test Management</h2>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create New Test</h3>
                        <form onSubmit={handleCreateTest}>
                            <input
                                className="modal-input"
                                type="text"
                                name="testName"
                                value={createFormData.testName}
                                onChange={handleCreateInputChange}
                                placeholder="Test Name"
                                required
                            />
                            <input
                                className="modal-input"
                                type="text"
                                name="testKey"
                                value={createFormData.testKey}
                                onChange={handleCreateInputChange}
                                placeholder="Test Key"
                                required
                            />
                            <div className="modal-datetime-row">
                                <input
                                    className="modal-input-date"
                                    type="datetime-local"
                                    name="beginDate"
                                    value={createFormData.beginDate}
                                    onChange={handleCreateInputChange}
                                    required
                                />
                                <input
                                    className="modal-input-date"
                                    type="datetime-local"
                                    name="endDate"
                                    value={createFormData.endDate}
                                    onChange={handleCreateInputChange}
                                    required
                                />
                            </div>
                            <input
                                className="modal-input"
                                type="text"
                                name="testTime"
                                value={createFormData.testTime}
                                onChange={handleCreateInputChange}
                                placeholder="Test Time (HH:MM:SS)"
                                required
                            />
                            <div className="modal-buttons">
                                <button type="button" className="close-btn" onClick={() => {
                                    setIsModalOpen(false);
                                    setCreateFormData("");
                                }}>
                                    Close
                                </button>
                                <button type="submit" className="submit-btn">
                                    {isLoading ? "Creating..." : "Create Test"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="test-list">
                <div className="create-test-container">
                    <h3>Tests</h3>
                    <div className="btn-group-test">
                        <button onClick={() => setIsModalOpen(true)} className="open-modal-btn">
                            Create Test
                        </button>
                        <div className="plus-icon"></div>
                    </div>
                </div>

                <ul>
                    {currentTests.map((test) => (
                        <li key={test.testId} className="test-item" onClick={() => { navigate(`test/${test.testId}`) }}>
                            <span className="test-name">{test.testName}</span>
                            <span className="test-date">{new Date(test.beginDate).toISOString().split('T')[0]}</span>
                            <div className="action-buttons">
                                <button className="edit-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTest(test);
                                    setEditModalOpen(true);
                                }}></button>
                                <button className="delete-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConfirmation(test.testId);
                                }}></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {Math.ceil(testList.length / testsPerPage) > 1 && (
                <div className="pagination-controls">
                    <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {Math.ceil(testList.length / testsPerPage)}</span>
                    <button onClick={nextPage} disabled={currentPage === Math.ceil(testList.length / testsPerPage)}>Next</button>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Test</h3>

                        <input
                            className="modal-input"
                            type="text"
                            value={selectedTest.testName}
                            onChange={(e) =>
                                setSelectedTest({ ...selectedTest, testName: e.target.value })
                            }
                            placeholder="Test Name"
                            required
                        />
                        <input
                            className="modal-input"
                            type="text"
                            value={selectedTest.testKey}
                            onChange={(e) =>
                                setSelectedTest({ ...selectedTest, testKey: e.target.value })
                            }
                            placeholder="Test Key"
                            required
                        />
                        <div className="modal-datetime-row">
                            <input
                                className="modal-input-date"
                                type="datetime-local"
                                value={selectedTest.beginDate}
                                onChange={(e) =>
                                    setSelectedTest({ ...selectedTest, beginDate: e.target.value })
                                }
                                required
                            />
                            <input
                                className="modal-input-date"
                                type="datetime-local"
                                value={selectedTest.endDate}
                                onChange={(e) =>
                                    setSelectedTest({ ...selectedTest, endDate: e.target.value })
                                }
                                required
                            />
                        </div>
                        <input
                            className="modal-input"
                            type="text"
                            value={selectedTest.testTime}
                            onChange={(e) =>
                                setSelectedTest({ ...selectedTest, testTime: e.target.value })
                            }
                            placeholder="Test Time (HH:MM:SS)"
                            required
                        />
                        <div className="modal-buttons">
                            <button className="close-btn" onClick={() => {
                                setEditModalOpen(false);
                                setSelectedTest(null);
                            }}>
                                Close
                            </button>
                            <button className="submit-btn" onClick={handleEditSubmit}>
                                {isLoading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Delete Test"
                content="Are you sure you want to delete this test? This action cannot be undone."
                setIsOpen={setIsConfirmModalOpen}
                onOK={confirmDelete}
            />
        </div>
    );
};

export default Admin;