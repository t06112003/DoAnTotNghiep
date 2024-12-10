import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};

export const getUserFromToken = () => {
    const token = JSON.parse(localStorage.getItem("userData"))?.token;
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded ? decoded.nameid : null;
};