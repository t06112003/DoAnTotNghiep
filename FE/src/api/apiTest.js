import API_ROUTES from "../constants/apiRoutes";
import { HEADER } from "../constants/apiHeaderConfig";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllTest = async () => {
    const response = await fetch(`${API_URL}${API_ROUTES.TEST_LIST}`);
    const data = await response.json();
    return data;
};

export const getTestDetail = async (testId) => {
    const response = await fetch(`${API_URL}${API_ROUTES.TEST_DETAIL}?TestId=${testId}`);
    const data = await response.json();
    return data;
}

export const getAllTestUser = async () => {
    const response = await fetch(`${API_URL}${API_ROUTES.TEST_LIST_USER}`);
    const data = await response.json();
    return data;
};

export const createTest = async (username, testName, testKey, beginDate, testTime, endDate) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.CREATE_TEST}`, {
            method: "POST",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                testName: testName,
                testKey: testKey,
                beginDate: beginDate,
                testTime: testTime,
                endDate: endDate
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const editTest = async (username, testId, testName, testKey, beginDate, testTime, endDate) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.EDIT_TEST}`, {
            method: "PUT",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                testId: testId,
                testName: testName,
                testKey: testKey,
                beginDate: beginDate,
                testTime: testTime,
                endDate: endDate
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const deleteTest = async (username, testId) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.DELETE_TEST}`, {
            method: "DELETE",
            headers: HEADER(),
            body: JSON.stringify({
                username: username,
                testId: testId,
            }),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const randomTest = async (username, testId, testKey) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.RANDOM_TEST}?Username=${username}&TestId=${testId}&TestKey=${testKey}`, {
            method: "GET",
            headers: HEADER(),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const testRemainingTime = async (username, testId) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.TEST_REMAINING_TIME}?Username=${username}&TestId=${testId}`, {
            method: "GET",
            headers: HEADER(),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const markViewTest = async (
    username = "",
    testName = "",
    dateFrom = "",
    dateTo = "",
    sort = "",
    sortAscending = false
) => {
    try {
        const response = await fetch(
            `${API_URL}${API_ROUTES.MARK_VIEW}?Username=${username}&TestName=${testName}&DateFrom=${dateFrom}&DateTo=${dateTo}&sort=${sort}&sortAscending=${!!sortAscending}`,
            {
                method: "GET",
                headers: HEADER(),
            });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const exportTest = async (username, testId) => {
    try {
        const response = await fetch(`${API_URL}${API_ROUTES.EXPORT_TEST}?Username=${username}&TestId=${testId}`, {
            method: "GET",
            headers: HEADER(),
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};