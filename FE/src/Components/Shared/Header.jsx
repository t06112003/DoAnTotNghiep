import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logoDuRiuImg2.png";
import { logOut } from "../../api/apiUser";

import { AppData } from "../../Root";

import "../../styles/Header.css";

const Header = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { userData, setUserData, showToast, setType, setMessage } = useContext(AppData);

    const handleLogout = () => {
        logOut(() => setUserData({}));
        navigate('/login');
        setType('toast-success');
        setMessage('Log out successfully!');
        showToast();
        setIsDropdownOpen(false);
    };

    const navigateHome = () => {
        navigate('/user');
    };

    return (
        <div className="header">
            <div className="header-left" onClick={navigateHome}>
                <img src={logo} alt="University Logo" className="logo" />
                <span className="university-name">DOODLERIU</span>
            </div>

            <div className="header-right">
                <div
                    className="profile-dropdown"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <span className="user-name">Welcome, {userData.name}</span>
                    {isDropdownOpen && (
                        <div className="dropdown-content">
                            <Link
                                to="/profile"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                Thông tin
                            </Link>
                            <button onClick={handleLogout}>Đăng xuất</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
