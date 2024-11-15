const API_ROUTES = {
    SUBMIT_ANSWER: '/Answer/SubmitAnswers',
    EDIT_ANSWER: '/Answer/EditAnswer',
    SEND_OTP: '/OTP/SendOTP',
    QUESTION_LIST: '/Question/QuestionList',
    CREATE_QUESTION: '/Question/CreateQuestionAndAnswers',
    IMPORT_QUESTIONS_WORD: '/Question/ImportQuestionsWord',
    EDIT_QUESTION: '/Question/EditQuestion',
    DELETE_QUESTION: '/Question/DeleteQuestion',
    ASSIGN_QUESTION: '/Question/AssignRandomQuestions',
    QUESTION_ASSIGN_LIST: '/Question/QuestionAssignList',
    QUESTION_ASSIGN: '/Question/QuestionAssign',
    TEST_LIST: '/Test/TestList',
    TEST_DETAIL: '/Test/TestDetail',
    TEST_LIST_USER: '/Test/TestListForUser',
    CREATE_TEST: '/Test/CreateTest',
    EDIT_TEST: '/Test/EditTest',
    DELETE_TEST: '/Test/DeleteTest',
    RANDOM_TEST: '/Test/RandomTest',
    TEST_REMAINING_TIME :'/Test/TestRemainingTime',
    MARK_VIEW: '/Test/MarkViewbyTest',
    EXPORT_TEST: '/Test/ExportTestResults',
    LOGIN: '/User/Login', 
    IMPORT_USERS: '/User/ImportUsers',
    CHANGE_PASSWORD: '/User/ChangePassword',
    CHANGE_EMAIL: '/User/ChangeEmail',
    FORGET_PASSWORD: '/User/ForgetPassword',
    CHECK_TEST_CODE: '/User/CheckUserTestCode',
    CHECK_IS_ADMIN: '/User/CheckIsAdmin',
    GET_INFO: '/User/GetInfo',
    USER_MARK_VIEW: '/UserMark/UserMarkView',
    LAST_RUN_TIMES: '/ServiceStatus/LastRunTimes',
}

export default API_ROUTES