import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';  // Admin panel component
import QuizPage from './components/QuizPage';      // Quiz page component
import QuestionTable from './components/QuestionTable';  // Import the QuestionTable component

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <nav>
          <ul>
            <li>
              <Link to="/admin">Admin Panel</Link>
            </li>
            <li>
              <Link to="/quiz">Take Quiz</Link>
            </li>
            <li>
              <Link to="/questions">Manage Questions</Link>  {/* Link to QuestionTable page */}
            </li>
          </ul>
        </nav>

        {/* Routes for different pages */}
        <Routes>
          {/* Admin panel for uploading quiz questions */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Quiz page to display and take quiz */}
          <Route path="/quiz" element={<QuizPage subject="Maths" />} />

          {/* Question management page to view and update questions */}
          <Route path="/questions" element={<QuestionTable />} />  {/* New Route for QuestionTable */}

          {/* Default Route - Redirect to Admin Panel or Home */}
          <Route path="/" element={<AdminPanel />} />

          {/* 404 Route for non-existing paths */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
