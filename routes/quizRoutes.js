const express = require('express');
const sql = require('mssql');
const router = express.Router();
const dbConfig = require('../dbConfig');

// Get all quizzes
router.get('/quizzes', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT QuizId, Title, Description 
            FROM Quizzes
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching quizzes:', error.message);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});
// Add a new quiz
router.post('/quizzes', async (req, res) => {
    const { title, description, questions } = req.body;

    if (!title || !description || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Invalid quiz data' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description)
            .query(`
                INSERT INTO Quizzes (Title, Description) 
                OUTPUT INSERTED.QuizId 
                VALUES (@Title, @Description)
            `);

        const quizId = result.recordset[0].QuizId;

        // Insert questions for the quiz
        const questionPromises = questions.map((question) =>
            pool.request()
                .input('QuizId', sql.Int, quizId)
                .input('QuestionText', sql.NVarChar, question.text)
                .input('Option1', sql.NVarChar, question.option1)
                .input('Option2', sql.NVarChar, question.option2)
                .input('Option3', sql.NVarChar, question.option3)
                .input('Option4', sql.NVarChar, question.option4)
                .input('CorrectOption', sql.Int, question.correctOption)
                .query(`
                    INSERT INTO Questions 
                    (QuizId, QuestionText, Option1, Option2, Option3, Option4, CorrectOption)
                    VALUES (@QuizId, @QuestionText, @Option1, @Option2, @Option3, @Option4, @CorrectOption)
                `)
        );

        await Promise.all(questionPromises);

        res.status(201).json({ message: 'Quiz created successfully', quizId });
    } catch (error) {
        console.error('Error creating quiz:', error.message);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});



// Get questions for a quiz
router.get('/questions', async (req, res) => {
    const { quizId } = req.query;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('QuizId', sql.Int, quizId)
            .query(`
                SELECT 
                    QuestionId, 
                    QuestionText, 
                    Option1, 
                    Option2, 
                    Option3, 
                    Option4, 
                    CorrectOption 
                FROM Questions 
                WHERE QuizId = @QuizId
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Record user response
router.post('/submit-response', async (req, res) => {
    const { name, rollNumber, quizId, answers, score } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('RollNumber', sql.NVarChar, rollNumber)
            .input('QuizId', sql.Int, quizId)
            .input('Answers', sql.NVarChar, JSON.stringify(answers)) // Store answers as JSON
            .input('Score', sql.Int, score)
            .query(`
                INSERT INTO responses (name, roll_number, quiz_id, answers, score)
                VALUES (@Name, @RollNumber, @QuizId, @Answers, @Score)
            `);

        res.status(200).json({ message: 'Response submitted successfully!' });
    } catch (error) {
        console.error('Error saving response:', error.message);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

// Get all responses for a specific quiz or all quizzes if quizId is not provided
router.get('/responses', async (req, res) => {
    const { quizId } = req.query;

    try {
        const pool = await sql.connect(dbConfig);
        let query = 'SELECT id, name, roll_number, quiz_id, answers, score FROM responses';
        if (quizId) {
            query += ' WHERE quiz_id = @QuizId';
        }
        const request = pool.request();
        if (quizId) {
            request.input('QuizId', sql.Int, quizId);
        }
        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching responses:', error.message);
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
});

// Fetch response details for a specific user response (new endpoint)
router.get('/response-details/:responseId', async (req, res) => {
    const { responseId } = req.params;
    const { quizId } = req.query;

    try {
        const pool = await sql.connect(dbConfig);

        // Fetch user's selected answers from the responses table
        const responseResult = await pool.request()
            .input('ResponseId', sql.Int, responseId)
            .query('SELECT answers FROM responses WHERE id = @ResponseId');

        if (responseResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Response not found' });
        }

        const userAnswers = JSON.parse(responseResult.recordset[0].answers); // Assuming answers are stored as JSON

        // Fetch the correct options and questions from the questions table
        const questionResult = await pool.request()
            .input('QuizId', sql.Int, quizId)
            .query(`
                SELECT 
                    QuestionId, 
                    QuestionText, 
                    Option1, 
                    Option2, 
                    Option3, 
                    Option4, 
                    CorrectOption 
                FROM Questions 
                WHERE QuizId = @QuizId
            `);

        const questions = questionResult.recordset;

        // Map the user's answers with the corresponding questions and correct options
        const responseDetails = questions.map((question) => {
            const selectedOptionKey = userAnswers[question.QuestionId]; // Get the user's answer for this question
            return {
                questionText: question.QuestionText,
                selectedOption: selectedOptionKey
                    ? question[`Option${selectedOptionKey}`]
                    : 'Not Answered', // Map user's choice or show "Not Answered"
                correctOption: question[`Option${question.CorrectOption}`], // Correct option
            };
        });

        res.status(200).json(responseDetails);
    } catch (error) {
        console.error('Error fetching response details:', error.message);
        res.status(500).json({ error: 'Failed to fetch response details' });
    }
});


// Get result for a user
router.get('/results', async (req, res) => {
    const { quizId, name } = req.query;

    if (!quizId || !name) {
        return res.status(400).json({ error: 'Missing required query parameters: quizId and name' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('QuizId', sql.Int, quizId)
            .input('Name', sql.NVarChar, name)
            .query(`
                SELECT score 
                FROM responses 
                WHERE quiz_id = @QuizId AND name = @Name
            `);

        if (result.recordset.length > 0) {
            res.status(200).json({ score: result.recordset[0].score });
        } else {
            res.status(404).json({ error: 'No results found for the given quizId and name' });
        }
    } catch (error) {
        console.error('Error fetching results:', error.message);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

module.exports = router;
