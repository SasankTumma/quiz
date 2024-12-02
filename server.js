const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const quizRoutes = require('./routes/quizRoutes');
const dbConfig = require('./dbConfig');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/api', quizRoutes);

// Test database connection
async function testConnection() {
    try {
        await sql.connect(dbConfig);
        console.log('Database connection successful!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

testConnection();

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
