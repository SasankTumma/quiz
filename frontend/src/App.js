import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EnterName from './components/EnterName';
import Quiz from './components/Quiz';
import Results from './components/Results';
import AdminResults from './components/AdminResults';
import './App.css';



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/quiz/:name" element={<Quiz />} />
                <Route path="/results" element={<Results />} />
                <Route path="/admin-results" element={<AdminResults />} />
                <Route path="/" element={<EnterName />} />
            </Routes>
        </Router>
    );
}

export default App;
