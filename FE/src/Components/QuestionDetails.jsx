import { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllQuestion, createQuestion, editQuestion, deleteQuestion, assignRandomQuestions, getQuestionAssigned, importQuestionsWord } from '../api/apiQuestion';
import { editAnswer } from '../api/apiAnswer';
import { deleteTestCode } from '../api/apiTest';
import { isAdmin } from '../api/apiUser';
import { AppData } from '../Root';
import '../styles/QuestionDetails.css';
import { checkSession } from "../utils/checkSession";
import { getUserFromToken } from "../utils/auth";

const QuestionDetails = () => {
    const username11 = getUserFromToken();
    const navigate = useNavigate();
    const { testId } = useParams();
    const { showToast, setType, setMessage } = useContext(AppData);
    const [questions, setQuestions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const [isEditAnswerModalOpen, setIsEditAnswerModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isListAssignModalOpen, setIsListAssignModalOpen] = useState(false);
    const [assignedQuestions, setAssignedQuestions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const dropZoneRef = useRef();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files[0];
        setSelectedFile(file);
    };

    const [newQuestion, setNewQuestion] = useState({
        questionText: "",
        questionDifficultyName: "Easy",
        questionMark: "",
        answers: [
            { answerText: "", isCorrect: false },
            { answerText: "", isCorrect: false },
        ]
    });

    const [selectedAnswer, setSelectedAnswer] = useState({
        answerId: '',
        answerText: '',
        isCorrect: false
    });

    const [assignInput, setAssignInput] = useState({
        easyQuestions: "",
        mediumQuestions: "",
        hardQuestions: "",
    });

    const handleFileSubmit = async () => {
        if (!selectedFile) {
            setType("toast-error");
            setMessage("Please select a file to upload.");
            showToast();
            return;
        }
        try {
            const response = await importQuestionsWord(selectedFile, testId, username11);
            const data = await response.json();
            if (response.ok) {
                setType("toast-success");
                setMessage(data.message || "File uploaded successfully!");
                showToast();
                setSelectedFile(null);
                fetchQuestions()
                setIsModalOpen(false)
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to upload file.");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Failed to assign questions.");
            showToast();
        }
    };

    const handleAssignChange = (e) => {
        setAssignInput({
            ...assignInput,
            [e.target.name]: parseInt(e.target.value),
        });
    };

    const handleAssignQuestions = async (e) => {
        e.preventDefault();
        try {
            const response = await assignRandomQuestions(
                username11,
                testId,
                assignInput.easyQuestions,
                assignInput.mediumQuestions,
                assignInput.hardQuestions
            );
            const data = await response.json();
            if (response.ok) {
                setType("toast-success");
                setMessage(data.message);
                showToast();
                setIsAssignModalOpen(false);
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to assign questions.");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Failed to assign questions.");
            showToast();
        }
    };

    const [currentPage, setCurrentPage] = useState(2);
    const questionsPerPage = 5;
    const questionsPerCodePage = 5;
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestion = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    const calculateAndSetCurrentPage = (questionsLength) => {
        const totalPages = Math.ceil(questionsLength / questionsPerPage);
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        } else if (currentPage < 1) {
            setCurrentPage(1);
        }
    };

    useEffect(() => {
        calculateAndSetCurrentPage(questions.length);
    }, [questions.length]);

    const nextPage = () => {
        if (currentPage < Math.ceil(questions.length / questionsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const groupQuestionsByCode = (questions) => {
        return questions.reduce((acc, question) => {
            const { code } = question;
            if (!acc[code]) {
                acc[code] = [];
            }
            acc[code].push(question);
            return acc;
        }, {});
    };


    const questionsByCode = groupQuestionsByCode(assignedQuestions);
    const [currentCodePage, setCurrentCodePage] = useState(0);
    const codes = Object.keys(questionsByCode);

    const currentCode = codes[currentCodePage];
    const totalCodePages = codes.length;
    const questionsForCurrentCode = questionsByCode[currentCode] || [];

    const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
    const totalQuestionPages = Math.ceil(questionsForCurrentCode.length / questionsPerCodePage);
    const paginatedQuestions = questionsForCurrentCode.slice(
        (currentQuestionPage - 1) * questionsPerCodePage,
        currentQuestionPage * questionsPerCodePage
    );

    const nextCodePage = () => {
        setCurrentCodePage((prev) => (prev + 1) % totalCodePages);
        setCurrentQuestionPage(1);
    };

    const prevCodePage = () => {
        setCurrentCodePage((prev) => (prev - 1 + totalCodePages) % totalCodePages);
        setCurrentQuestionPage(1);
    };

    const nextQuestionPage = () => setCurrentQuestionPage((prev) => prev + 1);
    const prevQuestionPage = () => setCurrentQuestionPage((prev) => prev - 1);

    const fetchQuestions = async () => {
        try {
            const response = await getAllQuestion(testId);
            const data = await response.json();
            if (response.ok) {
                setQuestions(data);
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to load Questions!");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    const fetchAssignQuestions = async () => {
        try {
            const response = await getQuestionAssigned(testId);
            const data = await response.json();
            if (response.ok) {
                setAssignedQuestions(data);
                setIsListAssignModalOpen(true);
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to load Questions!");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message);
            showToast();
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [testId]);

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            const response = await createQuestion(
                username11,
                testId,
                newQuestion.questionText,
                newQuestion.questionDifficultyName,
                newQuestion.questionMark,
                newQuestion.answers
            );
            const data = await response.json();

            if (response.ok) {
                setNewQuestion({
                    questionText: "",
                    questionDifficultyName: "Easy",
                    questionMark: "",
                    answers: [
                        { answerText: "", isCorrect: false },
                        { answerText: "", isCorrect: false },
                    ]
                });
                setIsModalOpen(false);
                setType("toast-success");
                setMessage(data.message);
                showToast();
                fetchQuestions();
            } else {
                setType("toast-error");
                setMessage(data.message);
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Failed to create question.");
            showToast();
        }
    };

    const handleAnswerChange = (index, field, value) => {
        const updatedAnswers = newQuestion.answers.map((answer, i) =>
            i === index ? { ...answer, [field]: value } : answer
        );
        setNewQuestion(prev => ({ ...prev, answers: updatedAnswers }));
    };

    const addAnswerField = () => {
        if (newQuestion.answers.length < 4) {
            setNewQuestion(prev => ({
                ...prev,
                answers: [...prev.answers, { answerText: "", isCorrect: false }]
            }));
        }
    };

    const handleEditQuestion = async (e) => {
        e.preventDefault();
        try {
            const response = await editQuestion(
                username11,
                currentQuestionId,
                newQuestion.questionText
            );
            const data = await response.json();
            if (response.ok) {
                setQuestions()
                setType("toast-success");
                setMessage("Question edited successfully!");
                showToast();
                setIsEditModalOpen(false);
                fetchQuestions();
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to edit Question!");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Failed to edit Question!");
            showToast();
        }
    };

    const openEditModal = (question) => {
        setCurrentQuestionId(question.questionId);
        setNewQuestion({ ...newQuestion, questionText: question.questionText });
        setIsEditModalOpen(true);
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            const response = await deleteQuestion(username11, questionId);
            const data = await response.json();
            if (response.ok) {
                setType("toast-success");
                setMessage("Question deleted successfully!");
                showToast();
                fetchQuestions();
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to delete Question!");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Failed to delete Question!");
            showToast();
        }
    };

    const openEditAnswerModal = (answer) => {
        setSelectedAnswer(answer);
        setIsEditAnswerModalOpen(true);
    };

    const handleEditAnswer = async (e) => {
        e.preventDefault();
        try {
            const response = await editAnswer(
                username11,
                selectedAnswer.answerId,
                selectedAnswer.answerText,
                selectedAnswer.isCorrect
            );
            const data = await response.json();
            if (response.ok) {
                const updatedQuestions = questions.map((q) => ({
                    ...q,
                    answers: q.answers.map((a) => (a.answerId === selectedAnswer.answerId ? selectedAnswer : a))
                }));
                setQuestions(updatedQuestions);
                setIsEditAnswerModalOpen(false);
                setType("toast-success");
                setMessage(data.message);
                showToast();
                fetchQuestions();
            } else {
                setType("toast-error");
                setMessage(data.message || "Failed to edit Answer!");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Failed to edit Answer!");
            showToast();
        }
    };

    const handleDeleteCode = async (code) => {
        try {
            const response = await deleteTestCode(username11, testId, code);
            if (response.ok) {
                setType("toast-success");
                setMessage("Test code deleted successfully!");
                showToast();

                // Update the UI after deletion
                if (totalCodePages > 1) {
                    nextCodePage(); // Navigate to the next code page if available
                } else {
                    setIsListAssignModalOpen(false); // Close modal if no codes are left
                }
                fetchAssignQuestions();
            } else {
                const errorData = await response.json();
                setType("toast-error");
                setMessage(errorData.message || "Failed to delete test code.");
                showToast();
            }
        } catch (error) {
            setType("toast-error");
            setMessage(error.message || "Error deleting test code.");
            showToast();
            console.error("Error deleting test code:", error);
        }
    };

    const checkAdminStatus = async () => {
        if (!checkSession()) {
            navigate("/");
            return;
        }

        try {
            const adminStatus = await isAdmin(username11);
            if (adminStatus.status != 200) {
                navigate("/user");
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            navigate("/user");
        }
    };

    useEffect(() => {
        checkAdminStatus();
    }, []);

    return (
        <div className="container">
            <h2>Test {testId} - Questions</h2>
            <div className="btn-groups">
                <div className="btn-group-question">
                    <button className="add-question-btn" onClick={() => setIsModalOpen(true)}>
                        Add Question
                    </button>
                    <div className="plus-icon"></div>
                </div>

                <div className="btn-group-question1">
                    <button className="assign-questions-btn" onClick={() => setIsAssignModalOpen(true)}>
                        Assign Random Questions
                    </button>
                    <div className="plus-icon"></div>
                </div>
            </div>
            <button className="show-assign" onClick={fetchAssignQuestions}>Show Assigned Questions</button>
            <ul>
                {currentQuestion.map((question) => (
                    <li key={question.questionId} className="question-item">
                        <div className="question-text">
                            <p>
                                <strong>{question.questionText}</strong> ({question.questionDifficultyName}, {question.questionMark} points)
                            </p>

                            <div className="action-buttons-question">
                                <button onClick={() => openEditModal(question)} className="edit-btn"></button>
                                <button onClick={() => handleDeleteQuestion(question.questionId)} className="delete-btn"></button>
                            </div>
                        </div>
                        <ul>
                            {question.answers?.map((answer) => (
                                <li
                                    key={answer.answerId}
                                    className={`answer-item ${answer.isCorrect ? 'correct-answer' : 'incorrect-answer'}`}
                                    onClick={() => openEditAnswerModal(answer)}
                                >
                                    <span>{answer.answerText}</span>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>

            {Math.ceil(questions.length / questionsPerPage) > 1 && (
                <div className="pagination-controls">
                    <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {Math.ceil(questions.length / questionsPerPage)}</span>
                    <button onClick={nextPage} disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}>Next</button>
                </div>
            )}

            {isEditAnswerModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Answer</h3>
                        <form onSubmit={handleEditAnswer}>
                            <div className="edit-answer-modal">
                                <input
                                    type="text"
                                    className="edit-text-input"
                                    value={selectedAnswer.answerText}
                                    onChange={(e) => setSelectedAnswer({ ...selectedAnswer, answerText: e.target.value })}
                                    placeholder="Edit answer text"
                                    required
                                />
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={selectedAnswer.isCorrect}
                                    onChange={(e) => setSelectedAnswer({ ...selectedAnswer, isCorrect: e.target.checked })}
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setIsEditAnswerModalOpen(false)} className="close-btn">Close</button>
                                <button type="submit" className="submit-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal two-column-modal">
                        <div className="modal-left">
                            <h3>Question Formatting Rules</h3>
                            <ul>
                                <li>Each question should be separated by a blank line.</li>
                                <li>The correct answer should have an asterisk (*) before it.</li>
                                <li>Use <code>&lt;br /&gt;</code> to add line breaks within a question or answer.</li>
                                <li>Incorrectly formatted questions will display an error.</li>
                            </ul>
                            <div
                                className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                                ref={dropZoneRef}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <p>Drag and drop your Word file here, or</p>
                                <label htmlFor="file-upload" className="choose-file-btn">
                                    Choose File
                                </label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                {selectedFile && <p className="file-name">{selectedFile.name}</p>}
                                <button onClick={handleFileSubmit} className="upload-btn">Upload File</button>
                            </div>
                        </div>

                        <div className="modal-right">
                            <h3 className="modal-title">Create New Question</h3>
                            <form onSubmit={handleCreateQuestion} className="modal-form">
                                <input
                                    type="text"
                                    value={newQuestion.questionText}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                                    placeholder="Enter question text"
                                    required
                                    className="modal-input"
                                />
                                <label className="modal-label">Difficulty:</label>
                                <select
                                    value={newQuestion.questionDifficultyName}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, questionDifficultyName: e.target.value }))}
                                    className="modal-select"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                                <input
                                    type="number"
                                    value={newQuestion.questionMark}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, questionMark: e.target.value }))}
                                    placeholder="Enter question mark"
                                    required
                                    className="modal-input"
                                />
                                <h4>Answers</h4>
                                {newQuestion.answers.map((answer, index) => (
                                    <div key={index} className="answer-field">
                                        <input
                                            type="text"
                                            value={answer.answerText}
                                            onChange={(e) => handleAnswerChange(index, 'answerText', e.target.value)}
                                            placeholder="Answer text"
                                            required
                                            className="answer-input"
                                        />
                                        <label className="answer-label">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={answer.isCorrect}
                                                onChange={() =>
                                                    setNewQuestion(prev => ({
                                                        ...prev,
                                                        answers: prev.answers.map((a, i) => ({
                                                            ...a,
                                                            isCorrect: i === index
                                                        }))
                                                    }))}
                                                className="correct-answer-radio"
                                            />
                                        </label>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addAnswerField}
                                    disabled={newQuestion.answers.length >= 4}
                                    className="add-answer-btn"
                                >
                                    Add Answer
                                </button>
                                <div className="modal-buttons">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setNewQuestion(() => ({
                                                questionText: "",
                                                questionDifficultyName: "Easy",
                                                questionMark: "",
                                                answers: [
                                                    { answerText: "", isCorrect: false },
                                                    { answerText: "", isCorrect: false }
                                                ]
                                            }));
                                            setSelectedFile(null);
                                        }}
                                        className="close-btn"
                                    >
                                        Close
                                    </button>
                                    <button type="submit" className="submit-btn">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Question</h3>
                        <form onSubmit={handleEditQuestion}>
                            <input
                                className="modal-input"
                                type="text"
                                value={newQuestion.questionText}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                                placeholder="Edit question text"
                                required
                            />
                            <div className="modal-buttons">
                                <button type="button" onClick={() => {
                                    setIsEditModalOpen(false)
                                    setNewQuestion(prev => ({ ...prev, questionText: "" }))
                                }}
                                    className="close-btn">Close</button>
                                <button type="submit" className="submit-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

            {isAssignModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Assign Random Questions</h3>
                        <form onSubmit={handleAssignQuestions}>
                            <label>Easy Questions:</label>
                            <input
                                className='modal-input'
                                type="number"
                                name="easyQuestions"
                                value={assignInput.easyQuestions}
                                onChange={handleAssignChange}
                                required
                            />

                            <label>Medium Questions:</label>
                            <input
                                className='modal-input'
                                type="number"
                                name="mediumQuestions"
                                value={assignInput.mediumQuestions}
                                onChange={handleAssignChange}
                                required
                            />

                            <label>Hard Questions:</label>
                            <input
                                className='modal-input'
                                type="number"
                                name="hardQuestions"
                                value={assignInput.hardQuestions}
                                onChange={handleAssignChange}
                                required
                            />

                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAssignModalOpen(false);
                                        setAssignInput("")
                                    }}
                                    className="close-btn"
                                >
                                    Close
                                </button>
                                <button type="submit" className="submit-btn">Assign</button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

            {isListAssignModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Assigned Questions - Code: {currentCode}</h3>
                        <button onClick={() => setIsListAssignModalOpen(false)} className="close-btn">Close</button>

                        <ul className="assigned-questions-list">
                            {paginatedQuestions.map((question) => (
                                <li key={question.questionId} className="question-item">
                                    <p><strong>{question.questionText}</strong></p>
                                    <ul className="answer-list">
                                        {question.answers.map((answer) => (
                                            <li key={answer.answerId} className="answer-item">
                                                {answer.answerText}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>

                        <div className="pagination-controls">
                            <button onClick={prevQuestionPage} disabled={currentQuestionPage === 1}>
                                Previous Questions
                            </button>
                            <span>Page {currentQuestionPage} of {totalQuestionPages}</span>
                            <button onClick={nextQuestionPage} disabled={currentQuestionPage === totalQuestionPages}>
                                Next Questions
                            </button>
                        </div>

                        <div className="pagination-controls">
                            <button onClick={prevCodePage} disabled={totalCodePages <= 1}>
                                Previous Code
                            </button>
                            <span>Code {currentCodePage + 1} of {totalCodePages}</span>
                            <button onClick={nextCodePage} disabled={totalCodePages <= 1}>
                                Next Code
                            </button>
                        </div>

                        <div className="delete-code-container">
                            <button
                                className="delete-code-btn"
                                onClick={() => handleDeleteCode(currentCode)}
                            >
                                Delete Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default QuestionDetails;