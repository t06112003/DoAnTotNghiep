import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logoDuRiuImg2.png";
import { logOut, getName } from "../../api/apiUser";

import { AppData } from "../../Root";

import { getUserFromToken } from "../../utils/auth";

import "../../styles/Header.css";

const Header = () => {
    const username11 = getUserFromToken();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { setUserData, showToast, setType, setMessage } = useContext(AppData);

    const fetchData = async () => {
        const fetchedName = await getName(username11);
        setName(fetchedName)
    }

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

    useEffect(() => {
        fetchData();
    }, [username11]);

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
                    <span className="user-name">Welcome, {name}</span>
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
