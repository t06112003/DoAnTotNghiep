import { useState, useEffect, useContext } from "react";
import { submitAnswer } from "../api/apiAnswer";
import { useNavigate } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { AppData } from "../Root";

const SubmitAnswerForm = () => {

  const navigate = useNavigate();

  const { userData, setUserData, showToast, setType, setMessage } = useContext(AppData);

  const [testId, setTestId] = useState("");
  const [testKey, setTestKey] = useState("");
  const [answers, setAnswers] = useState([{ QuestionId: "", AnswerId: "" }]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const addAnswerField = () => {
    setAnswers([...answers, { QuestionId: "", AnswerId: "" }]);
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = answers.map((answer, i) =>
      i === index ? { ...answer, [field]: value } : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputData = {
      Username: userData.username,
      TestId: parseInt(testId),
      TestKey: testKey,
      Answers: answers.map((a) => ({
        QuestionId: (a.QuestionId),
        AnswerId: (a.AnswerId),
      })),
    };

    try {
      const result = await submitAnswer(inputData);
      setSuccessMessage("Answers submitted successfully!");
      setErrorMessage("");
      console.log(result);
    } catch (error) {
      setErrorMessage(error.message || "Failed to submit answers");
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    if (!checkSession()) {
      navigate("/");
    }
  }, []);

  return (
    <div>
      <h1>Submit Answers</h1>
      <form onSubmit={handleSubmit}>
        {/* TestId Input */}
        <div>
          <label>Test ID:</label>
          <input
            type="number"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
          />
        </div>

        {/* TestKey Input */}
        <div>
          <label>Test Key:</label>
          <input
            type="text"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Question/Answer Inputs */}
        <div>
          <h3>Answers:</h3>
          {answers.map((answer, index) => (
            <div key={index}>
              <label>Question ID:</label>
              <input
                type="number"
                value={answer.QuestionId}
                onChange={(e) =>
                  handleAnswerChange(index, "QuestionId", e.target.value)
                }
                required
              />
              <label>Answer ID:</label>
              <input
                type="number"
                value={answer.AnswerId}
                onChange={(e) =>
                  handleAnswerChange(index, "AnswerId", e.target.value)
                }
                required
              />
            </div>
          ))}
          <button type="button" onClick={addAnswerField}>
            Add More Answers
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>

      {/* Error and Success Messages */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default SubmitAnswerForm;