import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Quiz() {
    const { name } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const quizId = queryParams.get('quizId');

        // Fetch questions for the selected quiz
        axios
            .get(`https://quiz-uh5k.onrender.com/api/questions?quizId=${quizId}`)
            .then((response) => setQuestions(response.data))
            .catch((error) => console.error(error));
    }, []);

    const handleOptionSelect = (questionId, option) => {
        setSelectedAnswers({ ...selectedAnswers, [questionId]: option });
    };

    const handleSubmitQuiz = () => {
        const queryParams = new URLSearchParams(window.location.search);
        const quizId = queryParams.get('quizId');
        const rollNumber = queryParams.get('rollNumber');

        axios
            .post('https://quiz-uh5k.onrender.com/api/submit-response', {
                name,
                rollNumber,
                quizId,
                answers: selectedAnswers, // Send answers along with the score
                score: Object.keys(selectedAnswers).reduce((total, questionId) => {
                    const question = questions.find(q => q.QuestionId.toString() === questionId);
                    return question.CorrectOption === selectedAnswers[questionId] ? total + 1 : total;
                }, 0),
            })
            .then(() => navigate(`/results?quizId=${quizId}&name=${name}`))
            .catch((error) => {
                console.error('Error submitting quiz:', error);
                alert('An error occurred while submitting your quiz.');
            });
    };

    if (!questions.length) return <p>Loading questions...</p>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="quiz-container">
            <h1>Quiz</h1>
            <h2>Welcome, {name}</h2>
            <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
            <p>{currentQuestion.QuestionText}</p>
            <div className="options-container">
                {[1, 2, 3, 4].map((optionNumber) => (
                    <button
                        key={optionNumber}
                        className={`option-button ${
                            selectedAnswers[currentQuestion.QuestionId] === optionNumber ? 'selected' : ''
                        }`}
                        onClick={() => handleOptionSelect(currentQuestion.QuestionId, optionNumber)}
                    >
                        {currentQuestion[`Option${optionNumber}`]}
                    </button>
                ))}
            </div>
            <div className="navigation-buttons">
                <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="nav-button"
                >
                    Previous
                </button>
                {currentQuestionIndex === questions.length - 1 ? (
                    <button onClick={handleSubmitQuiz} className="submit-button">
                        Submit
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="nav-button"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}

export default Quiz;
