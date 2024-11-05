import { useState, useEffect, useContext } from "react";
import { login, forgetPassword } from "../api/apiUser";
import { isAdmin } from "../api/apiUser";
import { useNavigate } from "react-router-dom";

import { checkSession } from "../utils/checkSession";
import { AppData } from "../Root";

import "../styles/Login.css";

const Login = () => {
    const navigate = useNavigate();

    const { showToast, setMessage, setType, setUserData } = useContext(AppData);

    const [username, setUsername] = useState("");
    const [username1, setUsername1] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await login(username, password);
            response.json().then(async data => {
                if (response.status === 200) {
                    localStorage.setItem('userData', JSON.stringify(data));
                    setUserData(data);
                    const adminStatus = await isAdmin(data.username);
                    setType('toast-success');
                    setMessage('Login successfully!')
                    showToast();
                    if (adminStatus.status === 200) {
                        navigate("/admin");
                    } else {
                        navigate("/submit-answer")
                    }
                }
                else {
                    setType('toast-error');
                    setMessage(data.message);
                    showToast();
                }
            });
        } catch (error) {
            setMessage(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await forgetPassword(username1, email);
            response.json().then((data) => {
                if (response.status === 200) {
                    setShowForgotPassword(false);
                    setType("toast-success");
                    setMessage(data.message);
                    showToast();
                } else {
                    setType("toast-error");
                    setMessage(data.message);
                    showToast();
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label type="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group password-group">
                    <label type="password">Password:</label>
                    <div>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className={`eye-icon ${passwordVisible ? "open" : "close"}`} onClick={togglePasswordVisibility}></div>
                    </div>
                </div>
                <button className="login-btn"type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
                {error && <p className="error">{error}</p>}

                <p className="forgot-password-link" onClick={() => setShowForgotPassword(true)}>
                    Forgot Password?
                </p>
            </form>

            {showForgotPassword && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Forgot Password</h2>
                        <form onSubmit={handleForgotPassword}>
                            <div className="input-group">
                                <label htmlFor="forgot-username">Username:</label>
                                <input
                                    type="text"
                                    id="forgot-username"
                                    value={username1}
                                    onChange={(e) => setUsername1(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="forgot-email">Email:</label>
                                <input
                                    type="email"
                                    id="forgot-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="modal-close" disabled={isLoading} onClick={() => {
                                    setShowForgotPassword(false);
                                    setUsername1("");
                                    setEmail("");
                                }}>
                                    Close
                                </button>
                                <button type="submit" className="modal-submit" disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Confirm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
