import API_ROUTES from "../constants/apiRoutes";

const API_URL = import.meta.env.VITE_API_URL;

export const getServiceStatus = async () => {
    const response = await fetch(`${API_URL}${API_ROUTES.LAST_RUN_TIMES}`);
    const data = await response.json();
    return data;
};