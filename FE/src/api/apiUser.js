import API_ROUTES from "../constants/apiRoutes";
import { HEADER, HEADERFORM } from "../constants/apiHeaderConfig";

const API_URL = import.meta.env.VITE_API_URL;

export const getName = async (username) => {
    const response = await fetch(
        `${API_URL}${API_ROUTES.GET_INFO}?Username=${username}`,
        {
            method: "GET",
            headers: HEADER(),
        }
    );
    const data = await response.json();
    return data.name;
};

export const getEmail = async (username) => {
    const response = await fetch(
        `${API_URL}${API_ROUTES.GET_INFO}?Username=${username}`,
        {
            method: "GET",
            headers: HEADER(),
        }
    );
    const data = await response.json();
    return data.email;
};

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.LOGIN}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const importUsers = async (file, username) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}${API_ROUTES.IMPORT_USERS}?adminUsername=${username}`, {
            method: "POST",
            headers: HEADERFORM(),
            body: formData,
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const changePassword = async (username, currentPassword, newPassword, oTP) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.CHANGE_PASSWORD}`, {
            method: "PUT",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                currentPassword: currentPassword,
                newPassword: newPassword,
                oTP: oTP
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const changeEmail = async (username, oTP, currentEmail, newEmail) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.CHANGE_EMAIL}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                oTP: oTP,
                currentEmail: currentEmail,
                newEmail: newEmail,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const forgetPassword = async (username, email) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.FORGET_PASSWORD}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                email: email,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const logOut = async (cleanUpData) => {
    localStorage.setItem("userData", "{}");
    cleanUpData();
};

export const isAdmin = async (username) => {
    const response = await fetch(`${API_URL}${API_ROUTES.CHECK_IS_ADMIN}?Username=${username}`);
    return response;
};

export const markViewUser = async (username, testName = "") => {
    try {
        const response = await fetch(
            `${API_URL}${API_ROUTES.USER_MARK_VIEW}?Username=${username}&TestName=${testName}`,
            {
                method: "GET",
                headers: HEADER(),
            });
        return response;
    } catch (error) {
        console.log(error);
    }
};