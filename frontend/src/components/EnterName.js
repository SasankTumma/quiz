import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EnterName() {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [passcode, setPasscode] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch available quizzes
        axios
            .get('https://quiz-uh5k.onrender.com/api/quizzes')
            .then((response) => setQuizzes(response.data))
            .catch((error) => console.error(error));
    }, []);

    const handleStartQuiz = (quizId) => {
        if (name.trim() && rollNumber.trim()) {
            navigate(`/quiz/${name}?quizId=${quizId}&rollNumber=${rollNumber}`);
        } else {
            alert('Please enter your name and roll number before starting the quiz.');
        }
    };

    const handleViewResults = () => {
        if (passcode === 'admin@open') {
            navigate('/admin-results');
        } else {
            alert('Invalid passcode!');
        }
    };

    return (
        <div className="enter-name-container">
            <h1 className="title">Welcome to the Quiz Platform</h1>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
            />
            <input
                type="text"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="input-field"
            />
            <h2 className="subtitle">Available Quizzes:</h2>
            <div className="quiz-list">
                {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                        <div className="quiz-box" key={quiz.QuizId}>
                            <h3 className="quiz-title">{quiz.Title || 'Unnamed Quiz'}</h3>
                            <a className="quiz-description">{quiz.Description || 'No description provided.'}</a>
                            <button
                                onClick={() => handleStartQuiz(quiz.QuizId)}
                                className="quiz-button"
                            >
                                Take Quiz
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Loading quizzes...</p>
                )}
            </div>
            <h2 className="subtitle">Admin Section</h2>
            <input
                type="password"
                placeholder="Enter passcode to view results"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="input-field"
            />
            <button onClick={handleViewResults} className="nav-button">
                View All Results
            </button>
        </div>
    );
}

export default EnterName;
