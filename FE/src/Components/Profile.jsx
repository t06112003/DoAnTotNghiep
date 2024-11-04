import React, { useState, useContext } from 'react';
import { AppData } from '../Root';
import { changeEmail, changePassword } from '../api/apiUser';
import '../styles/Profile.css';

const Profile = () => {
  const { userData, showToast, setType, setMessage } = useContext(AppData);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userEmail, setUserEmail] = useState(userData.email);

  const [changeEmailObject, setChangeEmailObject] = useState({
    currentPassword: '',
    currentEmail: userData.email,
    newEmail: '',
    oTP: '',
  });

  const [changePasswordObject, setChangePasswordObject] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
    oTP: '',
  });

  const handleChangeEmail = async () => {
    const response = await changeEmail(
      userData.username,
      changeEmailObject.oTP,
      changeEmailObject.currentEmail,
      changeEmailObject.newEmail
    );

    if (response.status === 200) {
      setUserEmail(changeEmailObject.newEmail);
      setIsChangingEmail(false);
      setType('toast-success');
      setMessage('Email changed successfully!');
    } else {
      const data = await response.json();
      setType('toast-error');
      setMessage(data.message || 'Failed to change email');
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

    const response = await changePassword(
      userData.username,
      changePasswordObject.currentPassword,
      changePasswordObject.newPassword,
      changePasswordObject.oTP
    );

    const data = await response.json();
    setMessage(data.message);
    if (response.status === 200) {
      setType('toast-success');
      setIsChangingPassword(false);
    } else {
      setType('toast-error');
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
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userEmail}</p>
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
          <input
            type="password"
            placeholder="Current Password"
            value={changeEmailObject.currentPassword}
            onChange={(e) => setChangeEmailObject({ ...changeEmailObject, currentPassword: e.target.value })}
          />
          <input
            type="text"
            placeholder="OTP Code"
            value={changeEmailObject.oTP}
            onChange={(e) => setChangeEmailObject({ ...changeEmailObject, oTP: e.target.value })}
          />
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
          <input
            type="text"
            placeholder="OTP Code"
            value={changePasswordObject.oTP}
            onChange={(e) => setChangePasswordObject({ ...changePasswordObject, oTP: e.target.value })}
          />
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