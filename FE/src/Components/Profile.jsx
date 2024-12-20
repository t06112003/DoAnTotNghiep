import { useState, useContext, useEffect } from 'react';
import { AppData } from '../Root';
import { changeEmail, changePassword, getEmail, getName, importUsers, isAdmin, markViewUser } from '../api/apiUser';
import { sendOTP } from '../api/apiOTP';
import { getServiceStatus } from '../api/apiService';
import { exportTest } from '../api/apiTest';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import { checkSession } from "../utils/checkSession";
import { getUserFromToken } from "../utils/auth";

const Profile = () => {
    const username11 = getUserFromToken();
    const navigate = useNavigate();
    const { showToast, setType, setMessage } = useContext(AppData);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [file, setFile] = useState(null);
    const [testId, setTestId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [testName, setTestName] = useState("");
    const [marks, setMarks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [marksPerPage] = useState(10);

    const [changeEmailObject, setChangeEmailObject] = useState({
        otpCode: '',
        currentEmail: email,
        newEmail: '',
    });


    const [changePasswordObject, setChangePasswordObject] = useState({
        otpCode: '',
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
    });

    const [serviceStatus, setServiceStatus] = useState({
        zeroScoreServiceLastRun: null,
        emailReminderServiceLastRun: null,
    });

    const paginatedMarks = marks.slice(
        (currentPage - 1) * marksPerPage,
        currentPage * marksPerPage
    );

    const totalPages = Math.ceil(marks.length / marksPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const fetchServiceStatus = async () => {
        try {
            const data = await getServiceStatus();
            setServiceStatus(data);
        } catch (error) {
            console.error('Failed to fetch service status:', error);
        }
    };

    const fetchUserMarks = async (filter = testName) => {
        try {
            const response = await markViewUser(username11, filter);
            if (response.ok) {
                const data = await response.json();
                setMarks(data);
                setCurrentPage(1);
            } else {
                const errorData = await response.json();
                setType("toast-error");
                setMessage(errorData.message || "Failed to fetch marks.");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Error fetching marks.");
            showToast();
        }
    };

    const fetchData = async () => {
        const fetchedName = await getName(username11);
        const fetchedEmail = await getEmail(username11);
        setName(fetchedName);
        setEmail(fetchedEmail);
        setChangeEmailObject((prev) => ({ ...prev, currentEmail: fetchedEmail }));
    };

    useEffect(() => {
        fetchData();
    }, [username11]);

    const checkAdminStatus = async () => {
        const adminStatus = await isAdmin(username11);
        if (checkSession()) {
            if (adminStatus.status === 200) {
                setIsAdminUser(true);
            } else {
                setIsAdminUser(false);
            }
        }
    };

    useEffect(() => {
        checkAdminStatus();
    }, [username11]);

    const handleChangeEmail = async () => {
        try {
            const response = await changeEmail(
                username11,
                changeEmailObject.otpCode,
                changeEmailObject.currentEmail,
                changeEmailObject.newEmail
            );
            const data = await response.json();
            if (response && response.ok) {
                setEmail(changeEmailObject.newEmail);
                setIsChangingEmail(false);
                setType('toast-success');
                setMessage('Email changed successfully!');
            } else {
                setType('toast-error');
                setMessage(data.message || 'Failed to change email');
            }
        } catch (error) {
            console.error(error);
            setType('toast-error');
            setMessage('An error occurred while changing the email.');
        }
        showToast();
    };

    const handleChangePassword = async () => {
        if (changePasswordObject.newPassword !== changePasswordObject.repeatPassword) {
            setType('toast-error');
            setMessage("New passwords don't match.");
            showToast();
            return;
        }

        try {
            const response = await changePassword(
                username11,
                changePasswordObject.otpCode,
                changePasswordObject.currentPassword,
                changePasswordObject.newPassword,
            );

            if (response && response.ok) {
                setType('toast-success');
                setMessage('Password changed successfully!');
                setIsChangingPassword(false);
            } else {
                const data = await response.json();
                setType('toast-error');
                setMessage(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error(error);
            setType('toast-error');
            setMessage('An error occurred while changing the password.');
        }
        showToast();
    };

    const handleSendOTP = async () => {
        const response = await sendOTP(username11, email);
        if (response && response.ok) {
            setType('toast-success');
            setMessage('OTP sent successfully!');
        } else {
            setType('toast-error');
            setMessage('Failed to send OTP.');
        }
        showToast();
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (file) {
            try {
                const response = await importUsers(file, username11);
                const data = await response.json();
                if (response.ok) {
                    setType('toast-success');
                    setMessage(data.message);
                    showToast();
                } else {
                    setType('toast-error');
                    setMessage(data.message || 'File import failed');
                    showToast();
                }
            } catch (error) {
                setType('toast-error');
                setMessage(error.message || 'File import failed');
                showToast();
            }
        }
    };

    const handleExport = async (e) => {
        e.preventDefault();
        try {
            const response = await exportTest(username11, testId);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                const contentDisposition = response.headers.get('content-disposition');
                const getFileNameFromContentDisposition = (contentDisposition) => {
                    const filenameMatch = contentDisposition.match(/filename\s*=\s*["']?([^;"']+)/i);
                    return filenameMatch[1];
                };
                const fileName = getFileNameFromContentDisposition(contentDisposition);

                link.setAttribute('download', fileName);

                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);

                setType("toast-success");
                setMessage("Export Successfully");
                showToast();
                setTestId('')
            } else {
                const data = await response.json();
                setType("toast-error");
                setMessage(data.message || "Failed to export test results");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage("An error occurred during export");
            showToast();
            console.error("Error exporting test results:", error);
        }
    };

    useEffect(() => {
        if (!checkSession()) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        fetchServiceStatus();
        fetchUserMarks();
    }, []);

    return (
        <div className="user-profile">
            <h2>
                <span role="img" aria-label="profile icon">📋</span> Your <span className="highlight">Profile</span>
            </h2>
            <div className="profile-details">
                <p><strong>Username:</strong> {username11}</p>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
            </div>
            <div className="button-group">
                <button onClick={() => setIsChangingEmail(true)} className="change-email-button">
                    <span role="img" aria-label="email icon">📧</span> Change Email
                </button>
                <button onClick={() => setIsChangingPassword(true)} className="change-password-button">
                    <span role="img" aria-label="lock icon">🔒</span> Change Password
                </button>
            </div>

            {isChangingEmail && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Change Email</h3>
                        <div className="otp-section">
                            <input
                                className='modal-input-otp'
                                type="text"
                                placeholder="OTP Code"
                                value={changeEmailObject.otpCode}
                                onChange={(e) => setChangeEmailObject({ ...changeEmailObject, otpCode: e.target.value })}
                            />
                            <button
                                onClick={handleSendOTP}
                                className='modal-button-otp'>Send</button>
                        </div>
                        <input
                            className='modal-input-email'
                            type="email"
                            placeholder="New Email"
                            value={changeEmailObject.newEmail}
                            onChange={(e) => setChangeEmailObject({ ...changeEmailObject, newEmail: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button className="modal-close" onClick={() => setIsChangingEmail(false)}>Cancel</button>
                            <button className="modal-submit" onClick={handleChangeEmail}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {isChangingPassword && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Change Password</h3>
                        <input
                            className='modal-input-password'
                            type="password"
                            placeholder="Current Password"
                            value={changePasswordObject.currentPassword}
                            onChange={(e) => setChangePasswordObject({ ...changePasswordObject, currentPassword: e.target.value })}
                        />
                        <div className="otp-section">
                            <input
                                type="text"
                                placeholder="OTP Code"
                                value={changePasswordObject.otpCode}
                                onChange={(e) => setChangePasswordObject({ ...changePasswordObject, otpCode: e.target.value })}
                            />
                            <button onClick={handleSendOTP}>Send</button>
                        </div>
                        <input
                            className='modal-input-password'
                            type="password"
                            placeholder="New Password"
                            value={changePasswordObject.newPassword}
                            onChange={(e) => setChangePasswordObject({ ...changePasswordObject, newPassword: e.target.value })}
                        />
                        <input
                            className='modal-input-password'
                            type="password"
                            placeholder="Repeat New Password"
                            value={changePasswordObject.repeatPassword}
                            onChange={(e) => setChangePasswordObject({ ...changePasswordObject, repeatPassword: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button className="modal-close" onClick={() => setIsChangingPassword(false)}>Cancel</button>
                            <button className="modal-submit" onClick={handleChangePassword}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {isAdminUser && (
                <div className="admin-upload-section">
                    <h3>Import Users</h3>
                    <div
                        className="drag-drop-area"
                        onDrop={(e) => {
                            e.preventDefault();
                            setFile(e.dataTransfer.files[0]);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <p>Drag and drop an Excel file here, or click to select</p>
                        <input type="file" onChange={handleFileChange} />
                    </div>
                    <button onClick={handleFileUpload}>Upload</button>
                </div>
            )}

            {isAdminUser && (
                <div className="service-status">
                    <h3>Service Status</h3>
                    <p>
                        <strong>Zero Score Service Last Run:</strong>{" "}
                        {serviceStatus.zeroScoreServiceLastRun
                            ? new Date(serviceStatus.zeroScoreServiceLastRun).toLocaleString()
                            : 'N/A'}
                    </p>
                    <p>
                        <strong>Email Reminder Service Last Run:</strong>{" "}
                        {serviceStatus.emailReminderServiceLastRun
                            ? new Date(serviceStatus.emailReminderServiceLastRun).toLocaleString()
                            : 'N/A'}
                    </p>
                    <button onClick={fetchServiceStatus} className="refresh-button">
                        Refresh
                    </button>
                </div>
            )}

            {isAdminUser && (
                <div className="export-test-container">
                    <h3>Export Test Results</h3>
                    <form onSubmit={handleExport}>
                        <input
                            type="text"
                            placeholder="Enter Test ID"
                            value={testId}
                            onChange={(e) => setTestId(e.target.value)}
                            required
                        />
                        <button type="submit">Export Results</button>
                    </form>
                </div>
            )}

            {!isAdminUser && (
                <div className="user-mark">
                    <h2>Your Profile</h2>
                    <div className="marks-section">
                        <h3>Test Marks</h3>
                        <div className="filter-section">
                            <input
                                type="text"
                                placeholder="Enter test name (optional)"
                                value={testName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setTestName(value);
                                    if (value === "") {
                                        fetchUserMarks("");
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        fetchUserMarks(testName);
                                    }
                                }}
                                className="test-name-input"
                            />
                        </div>
                        {marks.length > 0 ? (
                            <>
                                <ul className="marks-list">
                                    {paginatedMarks.map((mark, index) => (
                                        <li key={index} className="mark-item">
                                            <span className="test-name"><strong>Test Name:</strong> {mark.testName}</span>
                                            <br />
                                            <span className="test-mark"><strong>Mark:</strong> {mark.mark}</span>
                                        </li>
                                    ))}
                                </ul>
                                {Math.ceil(marks.length / marksPerPage) > 1 && (

                                    <div className="pagination-controls">
                                        <button onClick={prevPage} disabled={currentPage === 1}>
                                            Previous
                                        </button>
                                        <span>
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button onClick={nextPage} disabled={currentPage === totalPages}>
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>No marks found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
