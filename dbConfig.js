const dbConfig = {
    user: 'sasank08',
    password: 'Connect_to_quiz',
    server: 'connecttoquizdb.database.windows.net',
    database: 'Quiz_db',
    options: {
        encrypt: true, // Use encryption for Azure SQL
        enableArithAbort: true,
    },
};

module.exports = dbConfig;
