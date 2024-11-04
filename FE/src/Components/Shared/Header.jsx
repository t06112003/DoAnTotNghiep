import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/react.svg";
import { logOut } from "../../api/apiUser";

import { AppData } from "../../Root";

import "../../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const { userData, setUserData, showToast, setType, setMessage } = useContext(AppData);

  const handleLogout = () => {
    logOut(() => setUserData({}));
    navigate('/login');
    setType('toast-success');
    setMessage('Log out successfully!')
    showToast();
  };

  return (
    <div className="header">
        <div className="header-left">
          <img src={logo} alt="University Logo" className="logo" />
          <span className="university-name">GGGGGGGGGG</span>
        </div>

        <div className="header-middle">
          <input type="text" placeholder="Tìm kiếm..." className="search-bar" />
          <button className="search-button">
            <i className="fa fa-search"></i>
          </button>
        </div>

        <div className="header-right">
          <div className="profile-dropdown">
            <img
              src={logo}
              alt="User Profile"
              className="profile-pic"
            />
            <span className="user-name">{userData.name}</span>
            <div className="dropdown-content">
              <Link to="/profile">Thông tin cá nhân</Link>
              <Link to="/change-password">Đổi mật khẩu</Link>
              <button onClick={handleLogout}>Đăng xuất</button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Header;