import API_ROUTES from "../constants/apiRoutes";
import { HEADER } from "../constants/apiHeaderConfig";

const API_URL = import.meta.env.VITE_API_URL;

export const sendOTP = async (username, email) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.SEND_OTP}`, {
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