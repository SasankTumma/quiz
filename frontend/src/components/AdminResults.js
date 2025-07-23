import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminResults.css';


function AdminResults() {
    const [responses, setResponses] = useState([]);
    const [answersDetails, setAnswersDetails] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newQuiz, setNewQuiz] = useState({ title: '', description: '', questions: [] });
    const [quizzes, setQuizzes] = useState([]);
    const [showResponses, setShowResponses] = useState(true); // Toggle between quiz creation and responses

    // Fetch all responses
    useEffect(() => {
        axios
            .get('https://quiz-uh5k.onrender.com/api/responses')
            .then((response) => setResponses(response.data))
            .catch((error) => console.error('Error fetching responses:', error));

        axios
            .get('https://quiz-uh5k.onrender.com/api/quizzes')
            .then((response) => setQuizzes(response.data))
            .catch((error) => console.error('Error fetching quizzes:', error));
    }, []);

    const fetchResponseDetails = (responseId, quizId) => {
        axios
            .get(`https://quiz-uh5k.onrender.com/api/response-details/${responseId}?quizId=${quizId}`)
            .then((response) => {
                setAnswersDetails(response.data);
                setIsModalOpen(true);
            })
            .catch((error) => console.error('Error fetching response details:', error));
    };

    const handleAddQuestion = () => {
        setNewQuiz({
            ...newQuiz,
            questions: [...newQuiz.questions, { text: '', option1: '', option2: '', option3: '', option4: '', correctOption: 1 }]
        });
    };

    const handleSubmitQuiz = () => {
        axios
            .post('https://quiz-uh5k.onrender.com/api/quizzes', newQuiz)
            .then(() => {
                alert('Quiz created successfully!');
                setNewQuiz({ title: '', description: '', questions: [] });
                axios.get('https://quiz-uh5k.onrender.com/api/quizzes').then((response) => setQuizzes(response.data));
            })
            .catch((error) => console.error('Error creating quiz:', error));
    };

    return (
        <div className="admin-container">
            <h1 className="title">Admin Dashboard</h1>
            <button onClick={() => setShowResponses(!showResponses)}>
                {showResponses ? 'Create Quiz' : 'View Responses'}
            </button>

            {/* Display all responses */}
            {showResponses && (
                <div className="results-container">
                    <h2>All Quiz Responses</h2>
                    {responses.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Roll Number</th>
                                    <th>Quiz ID</th>
                                    <th>Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responses.map((response, index) => (
                                    <tr key={index}>
                                        <td>{response.name}</td>
                                        <td>{response.roll_number}</td>
                                        <td>{response.quiz_id}</td>
                                        <td>{response.score}</td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    fetchResponseDetails(response.id, response.quiz_id)
                                                }
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Loading responses...</p>
                    )}

                    {/* Modal to display the selected answers */}
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h2>Response Details</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Question</th>
                                            <th>Selected Option</th>
                                            <th>Correct Option</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {answersDetails.map((detail, index) => (
                                            <tr key={index}>
                                                <td>{detail.questionText}</td>
                                                <td>{detail.selectedOption}</td>
                                                <td>{detail.correctOption}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={() => setIsModalOpen(false)}>Close</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quiz creation section */}
            {!showResponses && (
                <div className="quiz-creation">
                    <h2>Create New Quiz</h2>
                    <input
                        type="text"
                        placeholder="Quiz Title"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Quiz Description"
                        value={newQuiz.description}
                        onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                    />
                    <h3>Questions</h3>
                    {newQuiz.questions.map((q, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                placeholder={`Question ${index + 1}`}
                                value={q.text}
                                onChange={(e) => {
                                    const questions = [...newQuiz.questions];
                                    questions[index].text = e.target.value;
                                    setNewQuiz({ ...newQuiz, questions });
                                }}
                            />
                            {['Option1', 'Option2', 'Option3', 'Option4'].map((opt, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    placeholder={opt}
                                    value={q[`option${i + 1}`]}
                                    onChange={(e) => {
                                        const questions = [...newQuiz.questions];
                                        questions[index][`option${i + 1}`] = e.target.value;
                                        setNewQuiz({ ...newQuiz, questions });
                                    }}
                                />
                            ))}
                            <div> selecct correct option</div>
                            <select
                                value={q.correctOption}
                                onChange={(e) => {
                                    const questions = [...newQuiz.questions];
                                    questions[index].correctOption = parseInt(e.target.value);
                                    setNewQuiz({ ...newQuiz, questions });
                                }}
                            >
                                <option value={1}>Option 1</option>
                                <option value={2}>Option 2</option>
                                <option value={3}>Option 3</option>
                                <option value={4}>Option 4</option>
                            </select>
                        </div>
                    ))}
                    <button onClick={handleAddQuestion}>Add Question</button>
                    <button onClick={handleSubmitQuiz}>Submit Quiz</button>
                </div>
            )}
        </div>
    );
}

export default AdminResults;
