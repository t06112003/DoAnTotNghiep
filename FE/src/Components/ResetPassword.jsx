import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/apiUser";
import { AppData } from "../Root";

import '../styles/ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showToast, setType, setMessage } = useContext(AppData);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setType("toast-error");
            setMessage("Password do not match!");
            showToast();
            return;
        }
        try {
            const response = await resetPassword(token, password);
            const data = await response.json();
            if (response.ok) {
                setType("toast-success");
                setMessage(data.message || "Reset password successfully!");
                showToast();
                navigate("/login");
            } else {
                setType("toast-error");
                setMessage(data.message);
                showToast();
            }
        } catch (err) {
            setType("toast-error");
            setMessage(err.message);
            showToast();
        }
    };

    return (
        <div className="reset-password-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;
