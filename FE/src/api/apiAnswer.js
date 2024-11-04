import API_ROUTES from "../constants/apiRoutes";
import { HEADER } from "../constants/apiHeaderConfig";

const API_URL = import.meta.env.VITE_API_URL;

export const submitAnswer = async (inputData) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.SUBMIT_ANSWER}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify(inputData),
        });
        if (response.status === 204) {
            return { message: "No content returned from the server." };
        }
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to submit answers");
        }
        return result;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("Invalid JSON response from server");
        } else {
            console.error("Error submitting answers:", error.message);
        }
        throw error;
    }
};

export const editAnswer = async (username, answerId, answerText, isCorrect) => {
    const response = await fetch(`${API_URL}${API_ROUTES.EDIT_ANSWER}`, {
        method: 'PUT',
        headers: HEADER(),
        body: JSON.stringify(
            {
                username: username,
                answerId: answerId,
                answerText: answerText,
                isCorrect: isCorrect,
            }),
    });
    return response;
}