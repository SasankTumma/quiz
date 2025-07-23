import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Results.css'; // Import a dedicated CSS file

function Results() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const quizId = searchParams.get('quizId');
    const name = searchParams.get('name');
    const [score, setScore] = useState(null);

    useEffect(() => {
        console.log('QuizId:', quizId, 'Name:', name);
        axios
            .get(`https://quiz-uh5k.onrender.com/api/results?quizId=${quizId}&name=${name}`)
            .then((response) => setScore(response.data.score))
            .catch((error) => {
                console.error("Error fetching results:", error);
                alert("An error occurred while fetching results. Redirecting to home.");
                navigate('/'); // Redirect to the home page on failure
            });
    }, [quizId, name]);

    return (
        <div className="results-container">
            <h1>Quiz Results</h1>
            {score !== null ? (
                <>
                    <p>{`Thank you, ${name}! Your score: ${score}`}</p>
                    <button className="home-button" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </>
            ) : (
                <p>Loading your results...</p>
            )}
        </div>
    );
}

export default Results;
