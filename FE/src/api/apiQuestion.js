import API_ROUTES from "../constants/apiRoutes";
import { HEADER, HEADERFORM } from "../constants/apiHeaderConfig";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllQuestion = async (testId) => {
    try {
        const response = await fetch(
            `${API_URL}${API_ROUTES.QUESTION_LIST}?TestId=${testId}`,
            {
                method: "GET",
                headers: HEADER(),
            });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const createQuestion = async (username, testId, questionText, questionDifficultyName, questionMark, answers) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.CREATE_QUESTION}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                testId: testId,
                questionText: questionText,
                questionDifficultyName: questionDifficultyName,
                questionMark: questionMark,
                answers: answers,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const importQuestionsWord = async (file, testId, username) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}${API_ROUTES.IMPORT_QUESTIONS_WORD}?TestId=${testId}&Username=${username}`, {
            method: "POST",
            headers: HEADERFORM(),
            body: formData,
        });

        return response;
    } catch (error) {
        console.log("Error uploading questions:", error);
    }
};

export const editQuestion = async (username, questionId, newQuestion) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.EDIT_QUESTION}`, {
            method: "PUT",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                questionId: questionId,
                questionText: newQuestion,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const deleteQuestion = async (username, questionId) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.DELETE_QUESTION}`, {
            method: "DELETE",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                questionId: questionId,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const assignRandomQuestions = async (username, testId, easyQuestions, mediumQuestions, hardQuestions) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.ASSIGN_QUESTION}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                testId: testId,
                easyQuestions: easyQuestions,
                mediumQuestions: mediumQuestions,
                hardQuestions: hardQuestions
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const getQuestionAssigned = async (testId) => {
    try {
        const response = await fetch(
            `${API_URL}${API_ROUTES.QUESTION_ASSIGN_LIST}?TestId=${testId}`, {
            method: "GET",
            headers: HEADER(),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const getQuestionAssign = async (username, testId) => {
    try {
        const response = await fetch(
            `${API_URL}${API_ROUTES.QUESTION_ASSIGN}?Username=${username}&TestId=${testId}`, {
            method: "GET",
            headers: HEADER(),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}