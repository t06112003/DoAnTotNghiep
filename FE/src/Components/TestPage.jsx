import { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getQuestionAssign } from '../api/apiQuestion';
import { AppData } from "../Root";
import '../styles/TestPage.css';

const TestPage = () => {
    const { testId } = useParams();
    const { userData } = useContext(AppData);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState();
    const [answeredQuestions, setAnsweredQuestions] = useState({});
    const questionRefs = useRef([]);

    const handleAnswerSelection = (questionId) => {
        setAnsweredQuestions((prev) => ({
            ...prev,
            [questionId]: true,
        }));
    };

    const scrollToQuestion = (index) => {
        const headerHeight = 95;
        const questionPosition = questionRefs.current[index].offsetTop - headerHeight;
        window.scrollTo({ top: questionPosition, behavior: 'smooth' });
    };

    useEffect(() => {
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
        fetchQuestions();
    }, [questions.length, testId, userData.username]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!questions || questions.length === 0) {
        return <p>No questions found for this test.</p>;
    }

    return (
        <div className="page-container">
            {/* Test Content Container */}
            <div className="test-content">
                <h2 className="test-header">Your Test</h2>
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
                                                onChange={() => handleAnswerSelection(question.questionId)}
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

            {/* Sticky Sidebar for Question List */}
            <div className="question-sidebar">
                <h3>Danh sách câu hỏi</h3>
                <div className="question-list">
                    {questions.map((_, index) => (
                        <button
                            key={index}
                            className={`question-number ${answeredQuestions[questions[index].questionId] ? 'answered' : ''
                                }`}
                            onClick={() => scrollToQuestion(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestPage;
