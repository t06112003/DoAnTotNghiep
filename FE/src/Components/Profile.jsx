import { useState, useContext, useEffect } from 'react';
import { AppData } from '../Root';
import { changeEmail, changePassword, getEmail, getName } from '../api/apiUser';
import { sendOTP } from '../api/apiOTP';
import '../styles/Profile.css';

const Profile = () => {
    const { userData, showToast, setType, setMessage } = useContext(AppData);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [changeEmailObject, setChangeEmailObject] = useState({
        oTP: '',
        currentEmail: email,
        newEmail: '',
    });


    const [changePasswordObject, setChangePasswordObject] = useState({
        oTP: '',
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            const fetchedName = await getName(userData.username);
            const fetchedEmail = await getEmail(userData.username);
            setName(fetchedName);
            setEmail(fetchedEmail);
            setChangeEmailObject((prev) => ({ ...prev, currentEmail: fetchedEmail }));
        };
        fetchData();
    }, [userData.username]);

    const handleChangeEmail = async () => {
        try {
            const response = await changeEmail(
                userData.username,
                changeEmailObject.oTP,
                changeEmailObject.currentEmail,
                changeEmailObject.newEmail
            );

            if (response && response.ok) {
                setEmail(changeEmailObject.newEmail);
                setIsChangingEmail(false);
                setType('toast-success');
                setMessage('Email changed successfully!');
            } else {
                const data = await response.json();
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
                userData.username,
                changePasswordObject.oTP,
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
        const response = await sendOTP(userData.username, email);
        if (response && response.ok) {
            setType('toast-success');
            setMessage('OTP sent successfully!');
        } else {
            setType('toast-error');
            setMessage('Failed to send OTP.');
        }
        showToast();
    };

    return (
        <div className="user-profile">
            <h2>
                <span role="img" aria-label="profile icon">📋</span> Your <span className="highlight">Profile</span>
            </h2>
            <div className="profile-details">
                <p><strong>User name:</strong> {userData.username}</p>
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
                <div className="modal">
                    <h3>Change Email</h3>
                    <div className="otp-section">
                        <input
                            type="text"
                            placeholder="OTP Code"
                            value={changeEmailObject.oTP}
                            onChange={(e) => setChangeEmailObject({ ...changeEmailObject, oTP: e.target.value })}
                        />
                        <button onClick={handleSendOTP}>Send</button>
                    </div>
                    <input
                        type="email"
                        placeholder="New Email"
                        value={changeEmailObject.newEmail}
                        onChange={(e) => setChangeEmailObject({ ...changeEmailObject, newEmail: e.target.value })}
                    />
                    <button onClick={handleChangeEmail}>Submit</button>
                    <button onClick={() => setIsChangingEmail(false)}>Cancel</button>
                </div>
            )}

            {isChangingPassword && (
                <div className="modal">
                    <h3>Change Password</h3>
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={changePasswordObject.currentPassword}
                        onChange={(e) => setChangePasswordObject({ ...changePasswordObject, currentPassword: e.target.value })}
                    />
                    <div className="otp-section">
                        <input
                            type="text"
                            placeholder="OTP Code"
                            value={changePasswordObject.oTP}
                            onChange={(e) => setChangePasswordObject({ ...changePasswordObject, oTP: e.target.value })}
                        />
                        <button onClick={handleSendOTP}>Send</button>
                    </div>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={changePasswordObject.newPassword}
                        onChange={(e) => setChangePasswordObject({ ...changePasswordObject, newPassword: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Repeat New Password"
                        value={changePasswordObject.repeatPassword}
                        onChange={(e) => setChangePasswordObject({ ...changePasswordObject, repeatPassword: e.target.value })}
                    />
                    <button onClick={handleChangePassword}>Submit</button>
                    <button onClick={() => setIsChangingPassword(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
}

export default Profile;
