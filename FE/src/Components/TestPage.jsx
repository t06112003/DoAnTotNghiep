import { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestionAssign } from '../api/apiQuestion';
import { getTestDetail, testRemainingTime } from '../api/apiTest'
import { AppData } from "../Root";
import { submitAnswer } from '../api/apiAnswer';
import Timer from './Shared/Timer';
import '../styles/TestPage.css';

const TestPage = () => {
    const { testId } = useParams();
    const { userData, showToast, setType, setMessage } = useContext(AppData);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [testName, setTestName] = useState('');
    const [remainTime, setRemainTime] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const questionRefs = useRef([]);

    const handleAnswerSelection = (questionId, answerId) => {
        setAnsweredQuestions((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));

        const updatedAnswers = {
            ...answeredQuestions,
            [questionId]: answerId,
        };
        const storageKey = `test-${testId}-${userData.username}-answers`;
        sessionStorage.setItem(storageKey, JSON.stringify(updatedAnswers));
    };

    const handleSubmit = async () => {
        const inputData = {
            username: userData.username,
            testId: testId,
            answers: Object.keys(answeredQuestions).map((questionId) => ({
                questionId: Number(questionId),
                answerId: answeredQuestions[questionId],
            })),
        };

        try {
            const response = await submitAnswer(inputData);
            setMessage(response.message || "Answers submitted successfully!");
            setType("toast-success");
            showToast();
        } catch (error) {
            setMessage(error.message || "Failed to submit answers.");
            setType("toast-error");
            showToast();
        }
    };

    const scrollToQuestion = (index) => {
        const headerHeight = 95;
        const questionPosition = questionRefs.current[index].offsetTop - headerHeight;
        window.scrollTo({ top: questionPosition, behavior: 'smooth' });
    };

    const fetchTestRemainingTime = async () => {
        try {
            const response = await testRemainingTime(userData.username, testId);
            const data = await response.json();
            if (response.ok) {
                const [hours, minutes, seconds] = data.remainingTime.split(':').map(Number);
                const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
                setRemainTime(timeInSeconds);
            }
        } catch (error) {
            console.error('Error fetching test details:', error);
        }
    };

    const fetchTestDetails = async () => {
        try {
            const response = await getTestDetail(testId);
            if (response.length > 0) {
                const data = response[0];
                setTestName(data.testName);
            }
        } catch (error) {
            console.error('Error fetching test details:', error);
        }
    };

    const fetchQuestions = async () => {
        if (questions.length === 0) {
            try {
                setIsLoading(true);
                const response = await getQuestionAssign(userData.username, testId);
                if (response.ok) {
                    const data = await response.json();
                    setQuestions(data);
                } else {
                    console.error("Failed to load questions.");
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [questions.length, testId, userData.username]);

    useEffect(() => {
        fetchTestDetails();
        fetchTestRemainingTime();

        // Retrieve answers for the current user and test
        const storageKey = `test-${testId}-${userData.username}-answers`;
        const savedAnswers = sessionStorage.getItem(storageKey);
        if (savedAnswers) {
            setAnsweredQuestions(JSON.parse(savedAnswers));
        }
    }, [testId, userData.username]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!questions || questions.length === 0) {
        return <p>No questions found for this test.</p>;
    }

    return (
        <div className="page-container">
            <div className="test-content">
                <h2 className="test-header">{testName}</h2>
                <ul className="test-question-list">
                    {questions.map((question, index) => (
                        <li
                            key={question.questionId}
                            className="test-question-item"
                            ref={(el) => (questionRefs.current[index] = el)}
                        >
                            <div className="test-question-text">
                                <strong>Q{index + 1}:</strong> {question.questionText}
                            </div>
                            <ul className="test-answer-list">
                                {question.answers &&
                                    question.answers.map((answer, answerIndex) => (
                                        <li key={answer.answerId} className="test-answer-item">
                                            <input
                                                type="radio"
                                                id={`answer-${answer.answerId}`}
                                                name={`question-${question.questionId}`}
                                                className="test-answer-input"
                                                checked={answeredQuestions[question.questionId] === answer.answerId}
                                                onChange={() => handleAnswerSelection(question.questionId, answer.answerId)}
                                            />
                                            <label htmlFor={`answer-${answer.answerId}`} className="test-answer-label">
                                                <span className="test-answer-label-letter">
                                                    {String.fromCharCode(65 + answerIndex)}.
                                                </span>
                                                {answer.answerText}
                                            </label>
                                        </li>
                                    ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="question-sidebar">
                <h3>Danh sách câu hỏi</h3>
                <div className="question-list">
                    {questions.map((_, index) => (
                        <button
                            key={index}
                            className={`question-number ${answeredQuestions[questions[index].questionId] ? 'answered' : ''}`}
                            onClick={() => scrollToQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                <Timer initialTime={remainTime} />
                <button onClick={handleSubmit} className="submit-button">
                    Submit Answers
                </button>
            </div>
        </div>
    );
};

export default TestPage;
